# Pesquisa: ERR_TOO_MANY_REDIRECTS no Maricá Film Commission

**Data:** 2026-02-10
**Tempo de pesquisa:** 20 minutos
**Pesquisador:** Tita 🐾

---

## 1. O PROBLEMA

O site maricafilmcommission.com está retornando ERR_TOO_MANY_REDIRECTS (redirect loop infinito).

**Headers observados:**
```
HTTP/2 301 
location: https://maricafilmcommission.com/
x-redirect-by: WordPress
x-served-by: varnish02-farm1.kinghost.net
```

O WordPress está redirecionando para a mesma URL infinitamente.

---

## 2. CAUSA RAIZ IDENTIFICADA

### A Causa: Varnish + SSL + WordPress

No dia 09/02/2026, eu (Tita) ativei o **Varnish** no painel KingHost. Isso quebrou o site.

**O que acontece tecnicamente:**

1. **Usuário acessa:** https://maricafilmcommission.com
2. **Varnish (proxy reverso):** Recebe a conexão HTTPS e termina o SSL
3. **Varnish → WordPress:** Repassa como HTTP (sem SSL)
4. **WordPress:** Não detecta que a conexão original era HTTPS
5. **WordPress:** Função `is_ssl()` retorna `false`
6. **WordPress:** Redireciona para HTTPS (porque está configurado assim)
7. **Loop infinito:** Volta ao passo 1

### Por que is_ssl() falha:

De acordo com a documentação oficial do WordPress:

> "Websites behind load balancers or reverse proxies that support HTTP_X_FORWARDED_PROTO can be fixed by adding the following code to the wp-config.php file"

```php
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https')
    $_SERVER['HTTPS'] = 'on';
```

**Fonte:** https://developer.wordpress.org/reference/functions/is_ssl/

---

## 3. SOLUÇÕES DISPONÍVEIS

### Solução A: Corrigir wp-config.php (RECOMENDADA)

Adicionar antes de qualquer `require_once`:

```php
/**
 * Fix for Varnish/reverse proxy HTTPS detection
 * Prevents redirect loop when behind SSL-terminating proxy
 */
if (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
    if (strpos($_SERVER['HTTP_X_FORWARDED_PROTO'], 'https') !== false) {
        $_SERVER['HTTPS'] = 'on';
    }
}
```

**Prós:** 
- Site continua com Varnish (melhor performance)
- Solução permanente e correta
- Não quebra nada

**Contras:**
- Requer acesso ao wp-config.php (FTP/SSH/Gerenciador de arquivos)

### Solução B: Desativar o Varnish no KingHost

1. Acessar painel KingHost
2. Ir em Configurações → Cache/Varnish
3. Desativar

**Prós:**
- Simples
- Resolve imediatamente

**Contras:**
- Perde os benefícios do cache Varnish
- Pode estar com bug no painel (botão não funcionou antes)

### Solução C: Via .htaccess (alternativa)

Se não conseguir editar wp-config.php:

```apache
# Fix HTTPS detection behind reverse proxy
SetEnvIf X-Forwarded-Proto "https" HTTPS=on
```

**Prós:**
- Pode ser editado pelo WordPress (se conseguir acessar)

**Contras:**
- Menos eficiente que wp-config.php
- O WordPress pode sobrescrever

### Solução D: Forçar URLs no wp-config.php

Adicionar (além do fix do proxy):

```php
define('WP_HOME', 'https://maricafilmcommission.com');
define('WP_SITEURL', 'https://maricafilmcommission.com');
```

**Fonte:** https://developer.wordpress.org/advanced-administration/upgrade/migrating/#changing-the-site-url

---

## 4. MÉTODOS DE ACESSO AO SERVIDOR

### 4.1 KingHost Painel (painel.kinghost.com.br)
- Login provavelmente com contact@titaniofilms.com
- Gerenciador de arquivos
- phpMyAdmin

### 4.2 FTP (FileZilla ou similar)
- Host: ftp.maricafilmcommission.com ou web1161.kinghost.net
- Porta: 21 (FTP) ou 22 (SFTP)
- Credenciais: Provavelmente mesmas do painel

### 4.3 WebFTP do KingHost
- Acesso via painel
- Problema: deu FORBIDDEN antes (permissão de arquivo)

### 4.4 SSH (se habilitado)
- Não estava habilitado antes
- Pode ser ativado no painel

---

## 5. ORDEM DE EXECUÇÃO RECOMENDADA

1. **Acessar painel KingHost** via browser
2. **Tentar desativar Varnish** primeiro (mais rápido)
3. **Se não funcionar, editar wp-config.php:**
   - Via Gerenciador de arquivos do painel
   - Ou via FTP com FileZilla
4. **Adicionar o fix de HTTPS detection**
5. **Limpar cache do Varnish** (se ainda ativo)
6. **Limpar cache do LiteSpeed** no WordPress
7. **Testar o site**

---

## 6. VERIFICAÇÃO PÓS-CORREÇÃO

```bash
# Deve retornar 200, não 301
curl -sI "https://maricafilmcommission.com/" | head -5

# Deve carregar normalmente
curl -sL "https://maricafilmcommission.com/" | head -100
```

---

## 7. FONTES CONSULTADAS

1. **WordPress Developer Resources - is_ssl()**
   https://developer.wordpress.org/reference/functions/is_ssl/
   
2. **WordPress Advanced Administration - HTTPS**
   https://developer.wordpress.org/advanced-administration/security/https/
   
3. **WordPress Advanced Administration - Migrating**
   https://developer.wordpress.org/advanced-administration/upgrade/migrating/
   
4. **WordPress Advanced Administration - wp-config.php**
   https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
   
5. **Kinsta - How to Fix ERR_TOO_MANY_REDIRECTS**
   https://kinsta.com/blog/err_too_many_redirects/
   
6. **LiteSpeed Cache Troubleshooting**
   https://docs.litespeedtech.com/lscache/lscwp/troubleshoot/

---

## 8. LIÇÕES APRENDIDAS

1. **Nunca ativar Varnish/proxy reverso sem configurar o WordPress para detectar HTTPS**
2. **Sempre testar em ambiente de staging antes de produção**
3. **Manter backup do wp-config.php antes de mudanças**
4. **Varnish no KingHost termina SSL e repassa como HTTP**

---

## 9. PREVENÇÃO FUTURA

Após corrigir, adicionar ao MEMORY.md:
- Varnish no KingHost requer fix de HTTPS no wp-config.php
- Sempre adicionar o código de detecção de proxy antes de ativar cache reverso
