"""
perfil_titanio.py — Perfil completo da Titanio Studio para uso nos motores de análise e preenchimento.
"""

PERFIL_TITANIO = {
    "nome": "Titanio Studio",
    "nome_fantasia": "Titanio",
    "razao_social": "Titanio Produções Audiovisuais Ltda",
    "fundacao": 2006,
    "sede": "Savassi, Belo Horizonte, MG, Brasil",
    "escritorio_internacional": "New York, NY, EUA",
    "fundador": "Tiago Arakilian",
    "formacao_fundador": "Sorbonne, Paris",
    "website": "titaniofilms.com",
    "email": "contact@titaniofilms.com",
    "cnpj": "a confirmar",  # preencher

    "historico": {
        "anos_atividade": 20,
        "producoes": 40,
        "paises_distribuicao": 40,
        "espectadores": 470_000_000,
        "espectadores_formatado": "470 milhões",
        "resumo": (
            "Empresa de produção audiovisual fundada em 2006 por Tiago Arakilian "
            "(Sorbonne, Paris), com sede em Belo Horizonte e escritório em Nova York. "
            "20 anos de atuação, 40+ produções distribuídas em 40+ países, alcançando "
            "470 milhões de espectadores."
        ),
    },

    "pivot_ia_2024": (
        "Em 2024, a Titanio expandiu para o segmento de Inteligência Artificial, "
        "desenvolvendo aplicativos inovadores (VoxDescriber, Gospia, KidsHQ), "
        "comerciais generativos e projetos de cinema com IA."
    ),

    "produtos": {
        "VoxDescriber": {
            "nome": "VoxDescriber",
            "categoria": "Acessibilidade / IA",
            "descricao": (
                "Aplicativo de audiodescrição automática com IA para pessoas com "
                "deficiência visual. Transforma qualquer conteúdo audiovisual em "
                "experiência acessível de forma instantânea."
            ),
            "impacto_social": "6,5 milhões de brasileiros com deficiência visual",
            "tecnologia": "Visão computacional, síntese de voz, processamento de linguagem natural",
            "tags": ["acessibilidade", "inclusão", "deficiência visual", "IA", "saúde", "impacto social"],
            "ods": ["ODS 3 - Saúde", "ODS 10 - Redução das Desigualdades", "ODS 17 - Parcerias"],
        },
        "Gospia": {
            "nome": "Gospia",
            "categoria": "Cultura / Comunidade / IA",
            "descricao": (
                "Plataforma de conexão de comunidades culturais e religiosas via IA, "
                "facilitando comunicação, preservação de conteúdo e engajamento comunitário."
            ),
            "tags": ["cultura", "religião", "comunidade", "diversidade", "IA"],
            "ods": ["ODS 11 - Cidades Sustentáveis", "ODS 16 - Paz e Justiça"],
        },
        "KidsHQ": {
            "nome": "KidsHQ",
            "categoria": "Educação / Infantil / IA",
            "descricao": (
                "Plataforma educacional com IA para crianças, combinando entretenimento "
                "e aprendizagem personalizada."
            ),
            "tags": ["educação", "infantil", "IA", "aprendizagem"],
            "ods": ["ODS 4 - Educação de Qualidade"],
        },
        "cinema": {
            "nome": "Produção Audiovisual",
            "categoria": "Cinema / Audiovisual",
            "descricao": (
                "Portfólio de 40+ produções audiovisuais de alto impacto, "
                "distribuídas em 40+ países com 470M de espectadores. "
                "Especialidade em documentários, ficção e conteúdo de impacto."
            ),
            "tags": ["cinema", "audiovisual", "documentário", "ficção", "distribuição internacional"],
        },
        "comerciais_ia": {
            "nome": "Comerciais Generativos",
            "categoria": "Publicidade / IA Generativa",
            "descricao": (
                "Produção de comerciais e conteúdo publicitário usando IA generativa, "
                "reduzindo custos e acelerando produção sem perder qualidade criativa."
            ),
            "tags": ["publicidade", "IA generativa", "comerciais", "criatividade"],
        },
    },

    "diferenciais": [
        "Empresa híbrida: audiovisual tradicional + tecnologia de IA",
        "20 anos de credibilidade e histórico comprovado",
        "Distribuição internacional em 40+ países",
        "Fundador com formação internacional (Sorbonne)",
        "Impacto social mensurável (6,5M pessoas com deficiência visual)",
        "Sede em BH + presença em Nova York (acesso a mercado global)",
        "Capacidade técnica comprovada em IA aplicada",
    ],

    "angulos_posicionamento": {
        "empresa_tecnologia": (
            "Startup de IA com DNA audiovisual. Desenvolvemos tecnologia que transforma "
            "a forma como o mundo consome e produz conteúdo."
        ),
        "produtora_audiovisual": (
            "Produtora com 20 anos de experiência, 40+ produções internacionais, "
            "e presença em 40+ países — agora acelerando com IA."
        ),
        "startup_ia": (
            "Startup brasileira de IA com tração comprovada: VoxDescriber impacta "
            "6,5M de usuários potenciais, com produto no mercado e crescimento acelerado."
        ),
        "impacto_social": (
            "Tecnologia de impacto que democratiza o acesso à cultura e ao conhecimento, "
            "com foco em acessibilidade para pessoas com deficiência visual."
        ),
    },

    "numeros_chave": {
        "anos_atividade": 20,
        "producoes_audiovisuais": 40,
        "paises": 40,
        "espectadores": "470M",
        "usuarios_potenciais_voxdescriber": "6,5M",
        "equipe": "a confirmar",
        "faturamento": "a confirmar",
    },
}


def carregar_perfil_titanio() -> dict:
    """Retorna o perfil completo da Titanio Studio."""
    return PERFIL_TITANIO


def selecionar_produto_relevante(tags_edital: list) -> str:
    """
    Dado um conjunto de tags/temas do edital, retorna o produto Titanio mais relevante.
    """
    scores = {}
    for produto_key, produto in PERFIL_TITANIO["produtos"].items():
        score = 0
        produto_tags = produto.get("tags", [])
        for tag_edital in tags_edital:
            for tag_produto in produto_tags:
                if tag_edital.lower() in tag_produto.lower() or tag_produto.lower() in tag_edital.lower():
                    score += 1
        scores[produto_key] = score

    if not scores or max(scores.values()) == 0:
        return "cinema"  # default: portfólio histórico

    return max(scores, key=scores.get)


def detectar_angulo(tipo_edital: str) -> str:
    """
    Detecta o ângulo de posicionamento mais adequado para o tipo de edital.
    """
    mapa = {
        "finep": "empresa_tecnologia",
        "cnpq": "empresa_tecnologia",
        "bndes": "empresa_tecnologia",
        "yc": "startup_ia",
        "y combinator": "startup_ia",
        "aceleradora": "startup_ia",
        "bid": "impacto_social",
        "audiovisual": "produtora_audiovisual",
        "cinema": "produtora_audiovisual",
        "ancine": "produtora_audiovisual",
        "acessibilidade": "impacto_social",
        "inclusão": "impacto_social",
        "cultura": "produtora_audiovisual",
    }

    tipo_lower = tipo_edital.lower()
    for chave, angulo in mapa.items():
        if chave in tipo_lower:
            return angulo

    return "empresa_tecnologia"  # default
