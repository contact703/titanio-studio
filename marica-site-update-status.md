# Maricá Film Commission - Site Update Status Report
**Data:** 2026-02-12
**Subagent:** marica-site-update

## ✅ CONCLUÍDO

### Tarefa 3: Copyright Footer
- **Status:** ✅ COMPLETO
- O footer (post 188) já está com copyright atualizado para **2026**
- Texto: "© 2026 maricafilmcommission. All Rights Reserved."

## 🔄 EM PROGRESSO

### Tarefa 1: Carrossel PT (post 893)

**Descobertas:**
- O carrossel é feito com **HTML customizado** dentro de um widget Elementor
- Cada card usa `background: linear-gradient(135deg, #053177 0%, #C11320 100%)` - gradiente, não imagem
- São **19 locações** no carrossel

**Locações identificadas:**
1. Praias de Itaipuaçu → /pt/praias-de-itaipuacu/
2. Praia de Ponta Negra → /pt/praia-de-ponta-negra/
3. Praia do Recanto → /pt/praia-do-recanto/
4. Extensão da Restinga → /pt/extensao-da-restinga/
5. Lagoa de Araçatiba → /pt/lagoa-de-aracatiba-2/
6. Gruta da Sacristia → /pt/gruta-da-sacristia/
7. Pedra do Macaco → /pt/pedra-do-macaco/
8. Farol de Ponta Negra → /pt/farol-de-ponta-negra/
9. Igreja Matriz de N. S. do Amparo → /pt/igreja-matriz-de-nossa-senhora-do-amparo-2/
10. Parque Linear do Flamengo → /pt/parque-linear-do-bairro-flamengo/
11. Estádio João Saldanha → /pt/estadio-de-futebol-joao-saldanha/
12. Cinema Henfil → /pt/cinema-henfil/
13. Pedra do Elefante → /pt/pedra-do-elefante-2/
14. Casa de Cultura → /pt/casa-de-cultura-pt/
15. Praça Orlando de Barros Pimentel → /pt/praca-orlando-de-barros-pimentel/
16. Fazenda Itaocaia → /pt/fazenda-itaocaia-pt/
17. Fazenda Joaquim Piñero → /pt/fazenda-joaquim-pinero-pt/
18. Aldeia Mata Verde Bonita → /pt/aldeia-mata-verde-bonita-pt/
19. Hospital Dr. Che Guevara → /pt/hospital-municipal-che-guevara-pt/

**Ações pendentes:**
1. Baixar 1 foto de cada pasta no Google Drive (19 pastas)
2. Fazer upload das fotos no WordPress
3. Atualizar o HTML do carrossel substituindo:
   - `background: linear-gradient(...)` por 
   - `background: url('URL_DA_IMAGEM') center/cover no-repeat;`

### Tarefa 2: Páginas Individuais

**Descobertas:**
- Planilha tem apenas **endereços** (texto), não coordenadas GPS
- Coordenadas precisam ser pesquisadas manualmente ou via Google Maps API

**Ações pendentes:**
1. Verificar cada página individual das 19 locações
2. Remover fotos duplicadas
3. Obter coordenadas GPS para cada local (pesquisar pelo endereço)
4. Corrigir os widgets Google Maps com coordenadas corretas

### Tarefa 4: Versão Inglês (post 335)

**Ações pendentes:**
1. Replicar atualizações do carrossel
2. Replicar correções das páginas individuais

## 📁 Recursos

### Google Drive - Pastas de Fotos
URL: https://drive.google.com/drive/folders/15ZlJ4y3sDJWhdQvRSYy3o3qVCIcNtigl

Pastas disponíveis:
- ALDEIA MATA VERDE BONITA
- Bairro Divinea  
- CASA DE CULTURA
- CINE HENFIL
- ESTÁDIO MUNICIPAL JOÃO SALDANHA
- FAROL DE PONTA NEGRA
- FAZENDA ITAOCAIA
- FAZENDA JOAQUIM PIÑERO
- GRUTA DA SACRISTIA
- Hospital Municipal Che Guevara
- LAGOA DE ARAÇATIBA
- PARÓQUIA NOSSA SENHORA DO AMPARO
- Parque Linear Flamengo
- PEDRA DO MACACO
- PRAÇA ORLANDO DE BARROS PIMENTEL
- PRAIA DE ITAPUAÇÚ
- PRAIA DE PONTA NEGRA
- PRAIA DO RECANTO
- RESTINGA

### WordPress Admin
- URL: https://maricafilmcommission.com/wp-admin
- Usuário: contact@titaniofilms.com (logado via Google)

### Planilha de Referência
URL: https://docs.google.com/spreadsheets/d/1FgQBh0TqWHCFntqFKYWwL2EnkwWQ5UlnWpLoOyMCUhQ/

### Credenciais MySQL
- Host: mysql.maricafilmcommission.com
- DB: maricafilmcomm
- User: maricafilmcomm
- Pass: m3g4v6t4

## ⚠️ Notas Importantes

1. **Não usar MutationObserver** - Scripts complexos causaram problemas antes
2. **Edições simples no Elementor** - Apenas modificar HTML direto
3. **Fotos não existem na biblioteca WP** - Precisam ser uploadadas do Drive

## 📋 Próximos Passos Recomendados

### Opção 1: Fazer manualmente (estimativa: 2-3 horas)

1. **Baixar fotos do Google Drive:**
   - Abrir cada uma das 19 pastas
   - Baixar 1 foto representativa de cada
   - Renomear arquivos para fácil identificação

2. **Upload no WordPress:**
   - Ir para Mídia > Adicionar arquivo de mídia
   - Upload todas as 19 fotos
   - Copiar as URLs de cada imagem

3. **Editar HTML do carrossel:**
   - Abrir página 893 no Elementor
   - Localizar widget HTML
   - Atualizar cada card com background-image

4. **Repetir para versão inglês (post 335)**

### Opção 2: Automação via WP-CLI (se disponível)

```bash
# Upload de imagem via WP-CLI
wp media import /path/to/image.jpg --title="Praia de Itaipuaçu"
```

### Opção 3: Usar imagens do Google Drive diretamente

⚠️ **NÃO RECOMENDADO** - Google Drive não suporta hotlink direto para imagens.

## 📝 Como editar o carrossel (instruções detalhadas)

### Passo 1: Acessar o Elementor
1. URL: https://maricafilmcommission.com/wp-admin/post.php?post=893&action=elementor
2. Aguardar carregar completamente

### Passo 2: Localizar o widget HTML
1. No painel Estrutura (lateral direita), expandir o **segundo** Contêiner
2. Você verá um elemento **HTML** - clicar nele
3. O painel esquerdo mostrará o código HTML

### Passo 3: Editar o código
Para cada card (19 total), localizar e substituir:

**DE (gradiente):**
```css
background: linear-gradient(135deg, #053177 0%, #C11320 100%);
```

**PARA (imagem):**
```css
background: url('https://maricafilmcommission.com/wp-content/uploads/YYYY/MM/NOME-DA-IMAGEM.jpg') center/cover no-repeat;
```

### Passo 4: Salvar
1. Clicar no botão "Publicar" (ou "Atualizar")
2. Verificar no site se as imagens aparecem

### Mapeamento Locação → Pasta no Drive

| # | Locação no Carrossel | Pasta no Drive |
|---|---------------------|----------------|
| 1 | Praias de Itaipuaçu | PRAIA DE ITAPUAÇÚ |
| 2 | Praia de Ponta Negra | PRAIA DE PONTA NEGRA |
| 3 | Praia do Recanto | PRAIA DO RECANTO |
| 4 | Extensão da Restinga | RESTINGA |
| 5 | Lagoa de Araçatiba | LAGOA DE ARAÇATIBA |
| 6 | Gruta da Sacristia | GRUTA DA SACRISTIA |
| 7 | Pedra do Macaco | PEDRA DO MACACO |
| 8 | Farol de Ponta Negra | FAROL DE PONTA NEGRA |
| 9 | Igreja Matriz N.S. Amparo | PARÓQUIA NOSSA SENHORA DO AMPARO |
| 10 | Parque Linear Flamengo | Parque Linear Flamengo |
| 11 | Estádio João Saldanha | ESTÁDIO MUNICIPAL JOÃO SALDANHA |
| 12 | Cinema Henfil | CINE HENFIL |
| 13 | Pedra do Elefante | (não listada - usar Bairro Divinea?) |
| 14 | Casa de Cultura | CASA DE CULTURA |
| 15 | Praça Orlando de Barros | PRAÇA ORLANDO DE BARROS PIMENTEL |
| 16 | Fazenda Itaocaia | FAZENDA ITAOCAIA |
| 17 | Fazenda Joaquim Piñero | FAZENDA JOAQUIM PIÑERO |
| 18 | Aldeia Mata Verde Bonita | ALDEIA MATA VERDE BONITA |
| 19 | Hospital Dr. Che Guevara | Hospital Municipal Che Guevara |

## 🎯 Resumo Executivo

**Concluído:** Copyright 2026 ✅

**Pendente:**
- Carrossel PT com imagens (19 fotos)
- Páginas individuais (duplicatas + coordenadas)
- Versão inglês

**Estimativa de tempo:** 3-4 horas de trabalho manual
