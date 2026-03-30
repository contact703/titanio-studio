# Briefing Técnico — Lei 15.211/2025 (Estatuto Digital da Criança e do Adolescente)
# Para: Code Ninja
# App: GospIA (rede social gospel com fórum, chat, rádio)
# Data: 2026-03-18

---

## O QUE É ESSA LEI

**Lei nº 15.211, de 17 de setembro de 2025** — Sancionada pelo Presidente da República.
Oficialmente chamada de **"Estatuto Digital da Criança e do Adolescente"** (não "FELCA").

Aplica-se a **todo app ou serviço digital** que:
- Seja direcionado a crianças/adolescentes, OU
- Tenha "acesso provável" por eles (app de rede social = sempre incluído)

**O GospIA tem fórum, comunidade, chat → é classificado como REDE SOCIAL pela lei → TOTALMENTE SUJEITO.**

---

## IMPACTOS DIRETOS NO GOSPIA — O QUE PRECISA MUDAR

### 🔴 OBRIGATÓRIO (violação = multa + bloqueio do app nas lojas)

#### 1. Verificação de Idade no Cadastro (Art. 9, 10, 12)
- **Proibido**: autodeclaração de idade ("tenho mais de 18 anos ✓")
- **Obrigatório**: mecanismo confiável de verificação de idade
- **Implementação mínima**:
  - Captura de data de nascimento
  - Integração com API de sinal de idade da Apple/Google (Art. 12, III)
  - Para usuários menores de 16 anos: exigir conta do responsável vinculada
  - Para conteúdo adulto (se houver): verificação mais robusta

#### 2. Contas de Menores Vinculadas a Responsáveis (Art. 24)
- Usuários até 16 anos: conta DEVE estar vinculada à conta de um responsável legal
- **Implementação**: 
  - Campo "você tem menos de 16 anos?" no cadastro
  - Se sim: email/conta do responsável obrigatório
  - Tabela `parent_guardian` no Supabase linkada ao user_id

#### 3. Suspensão Automática de Conta Infantil (Art. 24, §4)
- Se detectar indícios de que conta é operada por menor em desacordo com a lei:
  - Suspender acesso
  - Abrir processo de apelação do responsável

#### 4. Proibição de Perfil Comportamental de Menores (Art. 26)
- **Proibido**: criar perfil comportamental de crianças/adolescentes para publicidade
- Se o GospIA usar analytics de comportamento do usuário: EXCLUIR menores do tracking

#### 5. Remoção de Conteúdo Violador (Art. 29)
- Se notificado sobre conteúdo violando direitos de criança/adolescente:
  - Remover SEM precisar de ordem judicial
  - Prazo: imediato
  - Notificar usuário sobre a remoção com motivo

#### 6. Canal de Denúncia (Art. 28)
- Disponibilizar mecanismo de denúncia para violações a direitos de crianças
- Botão "Denunciar" nos posts do fórum com opção "Conteúdo inadequado para menores"

---

### 🟡 IMPORTANTE (prazo de adequação, mas necessário)

#### 7. Configurações de Privacidade no Nível Máximo por Padrão (Art. 7)
- Para contas de menores: privacidade no nível mais alto por padrão
- Perfil fechado, sem aparecer em buscas, sem recomendações personalizadas

#### 8. Ferramentas de Supervisão Parental (Art. 17, 18)
- Painel do responsável para:
  - Ver atividade do menor
  - Restringir interações
  - Limitar tempo de uso
  - Desativar notificações

#### 9. Sem Publicidade Direcionada por Perfilamento para Menores (Art. 22)
- Proibido usar dados do menor para direcionar anúncios
- Se GospIA tiver ads: excluir menores de qualquer targeting comportamental

#### 10. Retenção de Dados para Investigação (Art. 27, §2)
- Conteúdos reportados como abuso/exploração: manter logs pelo prazo do Marco Civil
- Notificar autoridades competentes quando detectar abuso sexual/aliciamento

---

## IMPACTO ESPECÍFICO POR FEATURE DO GOSPIA

| Feature | Impacto | O que fazer |
|---------|---------|-------------|
| **Cadastro** | Alto | Adicionar data nascimento, verificação de idade, vínculo com responsável para <16 |
| **Fórum** | Alto | Botão denúncia em posts, moderação de conteúdo, remoção sem ordem judicial |
| **Chat com Pastor Elder** | Médio | Filtrar conteúdo inadequado, não coletar dados de perfil comportamental de menores |
| **Rádio** | Baixo | Classificação indicativa do conteúdo |
| **Perfil** | Médio | Privacidade máxima por padrão para menores, sem aparecer em buscas |
| **Créditos/Planos** | Médio | Proibir compras por menores sem consentimento dos pais |

---

## IMPLEMENTAÇÃO TÉCNICA — SUGESTÃO DE CÓDIGO

### Tabelas Supabase a Criar

```sql
-- Informações de idade/responsável
CREATE TABLE user_age_verification (
  user_id UUID REFERENCES auth.users(id),
  birth_date DATE NOT NULL,
  is_minor BOOLEAN GENERATED ALWAYS AS (birth_date > CURRENT_DATE - INTERVAL '18 years') STORED,
  requires_guardian BOOLEAN GENERATED ALWAYS AS (birth_date > CURRENT_DATE - INTERVAL '16 years') STORED,
  guardian_user_id UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id)
);

-- Denúncias de conteúdo
CREATE TABLE content_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id),
  content_type TEXT, -- 'forum_post', 'comment', 'message'
  content_id UUID NOT NULL,
  reason TEXT, -- 'minor_safety', 'abuse', 'inappropriate', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'removed', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID
);

-- Log de remoções (Art. 30 - notificação ao usuário)
CREATE TABLE content_removals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL,
  content_type TEXT,
  author_id UUID REFERENCES auth.users(id),
  reason TEXT,
  removed_by TEXT, -- 'human' ou 'automated'
  notified_at TIMESTAMPTZ,
  appeal_deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Flow de Cadastro a Implementar

```typescript
// 1. Capturar data de nascimento obrigatório
// 2. Calcular se é menor
const isMinor = calculateAge(birthDate) < 18;
const requiresGuardian = calculateAge(birthDate) < 16;

// 3. Se < 16, pedir email do responsável
if (requiresGuardian) {
  // Mostrar tela: "Você tem menos de 16 anos. Precisamos do email de um responsável."
  // Enviar email de confirmação pro responsável
  // Conta fica suspensa até responsável confirmar
}

// 4. Configurar privacidade máxima para menores
if (isMinor) {
  await supabase.from('profiles').update({
    is_private: true,
    searchable: false,
    allow_messages_from: 'none',
    show_in_recommendations: false
  }).eq('id', userId);
}
```

---

## PRAZO DE ADEQUAÇÃO

A lei foi sancionada em **17/09/2025**. Regulamentação ainda em elaboração. Recomendo:
- **Imediato**: verificação de idade + botão denúncia no fórum
- **30 dias**: painel do responsável + políticas de privacidade atualizadas
- **60 dias**: relatório semestral de moderação (obrigatório se passar de 1 milhão de usuários)

---

## REFERÊNCIA LEGAL

Lei completa: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/L15211.htm

Artigos mais críticos para o GospIA:
- Art. 9-10: verificação de idade
- Art. 24: contas de menores vinculadas
- Art. 26: proibição de perfil comportamental
- Art. 28-30: denúncias e remoção de conteúdo
- Cap. IX (Arts. 24-26): regras específicas para redes sociais
