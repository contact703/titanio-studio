import { Bot } from '../types/bot';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * MediaProcessorBot
 * 
 * Processa automaticamente vídeos e áudios recebidos:
 * - Monitora pasta de mídia
 * - Extrai áudio de vídeos (ffmpeg)
 * - Transcreve áudio (Whisper)
 * - Salva transcrições
 * - Notifica quando processado
 */
export class MediaProcessorBot implements Bot {
  id = 'media-processor';
  name = 'Media Processor';
  avatar = '🎬';
  status: 'idle' | 'running' | 'error' = 'idle';
  
  private isRunning = false;
  private watchInterval: NodeJS.Timeout | null = null;
  private processedFiles: Set<string> = new Set();
  private readonly WATCH_INTERVAL = 10000; // 10 segundos
  private readonly SUPPORTED_VIDEO = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];
  private readonly SUPPORTED_AUDIO = ['.mp3', '.wav', '.m4a', '.ogg', '.aac'];
  
  // Diretórios
  private mediaDir: string;
  private outputDir: string;

  constructor() {
    this.mediaDir = path.join(process.cwd(), 'media', 'incoming');
    this.outputDir = path.join(process.cwd(), 'media', 'processed');
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.status = 'running';
    
    // Cria diretórios
    fs.mkdirSync(this.mediaDir, { recursive: true });
    fs.mkdirSync(this.outputDir, { recursive: true });
    
    // Carrega lista de arquivos já processados
    this.loadProcessedFiles();
    
    console.log('🎬 Media Processor iniciado');
    console.log(`   Monitorando: ${this.mediaDir}`);
    console.log(`   Output: ${this.outputDir}`);
    
    // Inicia monitoramento
    this.startWatching();
  }

  async stop(): Promise<void> {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
    this.isRunning = false;
    this.status = 'idle';
    console.log('🛑 Media Processor parado');
  }

  /**
   * Inicia monitoramento de pasta
   */
  private startWatching(): void {
    // Verifica imediatamente
    this.checkForNewMedia();
    
    // Depois a cada intervalo
    this.watchInterval = setInterval(() => {
      this.checkForNewMedia();
    }, this.WATCH_INTERVAL);
  }

  /**
   * Verifica por novos arquivos de mídia
   */
  private async checkForNewMedia(): Promise<void> {
    try {
      const files = fs.readdirSync(this.mediaDir);
      
      for (const file of files) {
        const filePath = path.join(this.mediaDir, file);
        const ext = path.extname(file).toLowerCase();
        
        // Pula se já processou
        if (this.processedFiles.has(file)) continue;
        
        // Verifica se é arquivo de vídeo
        if (this.SUPPORTED_VIDEO.includes(ext)) {
          await this.processVideo(filePath);
        }
        // Verifica se é arquivo de áudio
        else if (this.SUPPORTED_AUDIO.includes(ext)) {
          await this.processAudio(filePath);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar mídia:', error);
    }
  }

  /**
   * Processa arquivo de vídeo
   */
  private async processVideo(filePath: string): Promise<void> {
    const fileName = path.basename(filePath);
    const baseName = path.basename(fileName, path.extname(fileName));
    
    console.log(`🎬 Processando vídeo: ${fileName}`);
    
    try {
      // 1. Extrai áudio do vídeo
      const audioPath = path.join(this.outputDir, `${baseName}.wav`);
      await this.extractAudio(filePath, audioPath);
      
      // 2. Transcreve áudio
      const transcription = await this.transcribeAudio(audioPath);
      
      // 3. Salva transcrição
      const transcriptPath = path.join(this.outputDir, `${baseName}.txt`);
      fs.writeFileSync(transcriptPath, transcription);
      
      // 4. Salva também em formato estruturado
      const jsonPath = path.join(this.outputDir, `${baseName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify({
        originalFile: fileName,
        processedAt: new Date().toISOString(),
        duration: await this.getVideoDuration(filePath),
        transcription: transcription,
        audioFile: `${baseName}.wav`
      }, null, 2));
      
      // 5. Marca como processado
      this.markAsProcessed(fileName);
      
      console.log(`✅ Vídeo processado: ${fileName}`);
      console.log(`   📝 Transcrição: ${transcriptPath}`);
      
    } catch (error) {
      console.error(`❌ Erro ao processar vídeo ${fileName}:`, error);
    }
  }

  /**
   * Processa arquivo de áudio
   */
  private async processAudio(filePath: string): Promise<void> {
    const fileName = path.basename(filePath);
    const baseName = path.basename(fileName, path.extname(fileName));
    
    console.log(`🎵 Processando áudio: ${fileName}`);
    
    try {
      // 1. Converte para WAV se necessário
      const wavPath = path.join(this.outputDir, `${baseName}.wav`);
      await this.convertToWav(filePath, wavPath);
      
      // 2. Transcreve
      const transcription = await this.transcribeAudio(wavPath);
      
      // 3. Salva transcrição
      const transcriptPath = path.join(this.outputDir, `${baseName}.txt`);
      fs.writeFileSync(transcriptPath, transcription);
      
      // 4. Salva JSON
      const jsonPath = path.join(this.outputDir, `${baseName}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify({
        originalFile: fileName,
        processedAt: new Date().toISOString(),
        transcription: transcription
      }, null, 2));
      
      // 5. Marca como processado
      this.markAsProcessed(fileName);
      
      console.log(`✅ Áudio processado: ${fileName}`);
      console.log(`   📝 Transcrição: ${transcriptPath}`);
      
    } catch (error) {
      console.error(`❌ Erro ao processar áudio ${fileName}:`, error);
    }
  }

  /**
   * Extrai áudio de vídeo usando ffmpeg
   */
  private async extractAudio(videoPath: string, audioPath: string): Promise<void> {
    try {
      await execAsync(`ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}" -y`);
    } catch (error) {
      throw new Error(`Falha ao extrair áudio: ${error}`);
    }
  }

  /**
   * Converte áudio para WAV
   */
  private async convertToWav(inputPath: string, outputPath: string): Promise<void> {
    try {
      await execAsync(`ffmpeg -i "${inputPath}" -acodec pcm_s16le -ar 16000 -ac 1 "${outputPath}" -y`);
    } catch (error) {
      throw new Error(`Falha ao converter áudio: ${error}`);
    }
  }

  /**
   * Transcreve áudio usando Whisper
   */
  private async transcribeAudio(audioPath: string): Promise<string> {
    try {
      // Verifica se whisper está instalado
      const whisperPath = process.env.WHISPER_PATH || 'whisper';
      
      // Executa whisper
      const outputDir = path.dirname(audioPath);
      const baseName = path.basename(audioPath, '.wav');
      
      await execAsync(
        `${whisperPath} "${audioPath}" --model base --language Portuguese --output_dir "${outputDir}" --output_format txt`,
        { timeout: 300000 } // 5 minutos timeout
      );
      
      // Lê resultado
      const transcriptPath = path.join(outputDir, `${baseName}.txt`);
      if (fs.existsSync(transcriptPath)) {
        return fs.readFileSync(transcriptPath, 'utf-8');
      }
      
      return '[Transcrição não disponível]';
      
    } catch (error) {
      console.error('Erro na transcrição:', error);
      return '[Erro na transcrição - verifique se Whisper está instalado]';
    }
  }

  /**
   * Obtém duração do vídeo
   */
  private async getVideoDuration(videoPath: string): Promise<number> {
    try {
      const { stdout } = await execAsync(
        `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`
      );
      return parseFloat(stdout.trim()) || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Marca arquivo como processado
   */
  private markAsProcessed(fileName: string): void {
    this.processedFiles.add(fileName);
    
    // Salva lista
    const processedPath = path.join(this.outputDir, '.processed.json');
    fs.writeFileSync(processedPath, JSON.stringify([...this.processedFiles]));
  }

  /**
   * Carrega lista de arquivos processados
   */
  private loadProcessedFiles(): void {
    const processedPath = path.join(this.outputDir, '.processed.json');
    
    if (fs.existsSync(processedPath)) {
      const list = JSON.parse(fs.readFileSync(processedPath, 'utf-8'));
      this.processedFiles = new Set(list);
    }
  }

  /**
   * Processa arquivo específico (chamada manual)
   */
  async processFile(filePath: string): Promise<{ success: boolean; transcription?: string; error?: string }> {
    try {
      const ext = path.extname(filePath).toLowerCase();
      
      if (this.SUPPORTED_VIDEO.includes(ext)) {
        await this.processVideo(filePath);
      } else if (this.SUPPORTED_AUDIO.includes(ext)) {
        await this.processAudio(filePath);
      } else {
        return { success: false, error: 'Formato não suportado' };
      }
      
      const baseName = path.basename(filePath, ext);
      const transcriptPath = path.join(this.outputDir, `${baseName}.txt`);
      const transcription = fs.existsSync(transcriptPath) 
        ? fs.readFileSync(transcriptPath, 'utf-8')
        : undefined;
      
      return { success: true, transcription };
      
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Retorna estatísticas
   */
  getStats(): MediaStats {
    const files = fs.existsSync(this.outputDir) 
      ? fs.readdirSync(this.outputDir)
      : [];
    
    return {
      processedFiles: this.processedFiles.size,
      pendingFiles: fs.existsSync(this.mediaDir)
        ? fs.readdirSync(this.mediaDir).filter(f => !this.processedFiles.has(f)).length
        : 0,
      outputFiles: files.filter(f => !f.startsWith('.')).length,
      supportedFormats: [...this.SUPPORTED_VIDEO, ...this.SUPPORTED_AUDIO]
    };
  }
}

interface MediaStats {
  processedFiles: number;
  pendingFiles: number;
  outputFiles: number;
  supportedFormats: string[];
}
