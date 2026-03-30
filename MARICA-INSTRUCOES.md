# Instruções para Finalizar Carrossel - Maricá Film Commission

## Status Atual
- ✅ Fotos baixadas do Google Drive (28+ imagens)
- ✅ Fotos já uploadadas no WordPress
- ✅ Copyright já atualizado para 2026
- ⚠️ HTML do carrossel pronto, falta aplicar no Elementor

## Para Aplicar o Carrossel com Fotos

### Opção 1: Via Elementor (Recomendado)

1. Acesse: https://maricafilmcommission.com/wp-admin/post.php?post=893&action=elementor

2. No painel esquerdo, clique no widget "HTML" (já está selecionado)

3. No campo "Código HTML", selecione TODO o conteúdo (Cmd+A)

4. Substitua pelo conteúdo do arquivo:
   `/Volumes/TITA_039/MAC_MINI_03/.openclaw/workspace/marica-carousel-html.html`

5. Clique em "Publicar"

### Opção 2: Via MySQL (Direto)

Se preferir editar direto no banco:
- Host: mysql.maricafilmcommission.com
- DB: maricafilmcomm
- User: maricafilmcomm
- Pass: m3g4v6t4

Tabela: wp_postmeta
Post ID: 893 (Locações PT)
Meta key: _elementor_data

## Tarefas Restantes

### Páginas Individuais de Locações
- [ ] Verificar e remover fotos duplicadas
- [ ] Corrigir coordenadas dos mapas (planilha só tem endereços, não GPS)

### Versão Inglês
- [ ] Replicar carrossel para post 335 (Locations EN)

## URLs das Imagens (Referência)

| Locação | URL da Imagem |
|---------|---------------|
| Praias de Itaipuaçu | /2026/02/c-pia-de-dji_20250603134714_0355_d.jpg |
| Praia de Ponta Negra | /2026/01/locations_site_marica3-scaled.jpg |
| Praia do Recanto | /2026/02/c-pia-de-dji_20250603134519_0351_d.jpg |
| Extensão da Restinga | /2026/02/restinga-1.jpg |
| Lagoa de Araçatiba | /2026/02/c-pia-de-dji_20250603092836_0301_d.jpg |
| Gruta da Sacristia | (sem foto - mantém gradiente) |
| Pedra do Macaco | /2026/02/c-pia-de-dji_20250603103641_0316_d.jpg |
| Farol de Ponta Negra | /2026/02/farol-de-ponta-negra-1.jpg |
| Igreja Matriz | /2026/02/paroquia-nossa-senhora-do-amparo-1.jpg |
| Parque Linear | /2026/02/dji_20250603154629_0382_d.jpg |
| Estádio João Saldanha | /2026/02/estadio-municipal-joa-o-saldanha.jpg |
| Cinema Henfil | /2026/02/cine-henfil-1.jpg |
| Pedra do Elefante | /2026/02/c-pia-de-dji_20250603112100_0327_d.jpg |
| Casa de Cultura | /2026/02/casa-de-cultura-1.jpg |
| Praça Orlando | /2026/02/c-pia-de-dji_20250603144255_0370_d.jpg |
| Fazenda Itaocaia | /2026/02/co-pia-de-dji_20250603114655_0334_d.jpg |
| Fazenda Joaquim Piñero | /2026/02/fazenda-joaquim-pin-ero-1.jpg |
| Aldeia Mata Verde Bonita | /2026/02/aldeia-mata-verde-bonita-1-1.jpg |
| Hospital Che Guevara | /2026/02/50248968152_5156226c96_o-scaled-1.jpg |

Base URL: https://maricafilmcommission.com/wp-content/uploads

## Problemas Conhecidos
- A planilha de locações não tem coordenadas GPS, apenas endereços de texto
- Gruta da Sacristia só tinha vídeos no Drive (sem foto disponível)
