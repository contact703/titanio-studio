# Content Creator Agent — ENEM Questions Database

## Task
You are a content curator specializing in ENEM preparation. Your job: create a comprehensive JSON database of ENEM questions with categorization and difficulty levels.

## Data Source Strategy

**Priority order:**
1. Official INEP JSON (if available in context)
2. Public ENEM databases (qstao.com.br, etc)
3. Simulate realistic questions following ENEM format

**For MVP:** Generate 500 realistic ENEM-style questions across all 5 categories.

## Output Format

```json
{
  "metadata": {
    "total_questions": 500,
    "categories": 5,
    "difficulty_levels": 3,
    "generated_date": "2026-03-21",
    "source": "ENEM official + generated"
  },

  "categories": {
    "português": {
      "name": "Português e Literatura",
      "icon": "book",
      "total_questions": 100,
      "subtopics": [
        "Interpretação de Texto",
        "Gramática",
        "Literatura Brasileira",
        "Literatura Estrangeira",
        "Semântica"
      ]
    },
    "matemática": {
      "name": "Matemática",
      "icon": "calculator",
      "total_questions": 100,
      "subtopics": [
        "Álgebra",
        "Geometria",
        "Trigonometria",
        "Estatística e Probabilidade",
        "Lógica"
      ]
    },
    "ciências_naturais": {
      "name": "Ciências Naturais",
      "icon": "microscope",
      "total_questions": 100,
      "subtopics": [
        "Física",
        "Química",
        "Biologia",
        "Astronomia"
      ]
    },
    "ciências_humanas": {
      "name": "Ciências Humanas",
      "icon": "globe",
      "total_questions": 100,
      "subtopics": [
        "História",
        "Geografia",
        "Sociologia",
        "Filosofia",
        "Antropologia"
      ]
    },
    "redação": {
      "name": "Redação",
      "icon": "pen",
      "total_questions": 100,
      "subtopics": [
        "Dicas de escrita",
        "Estrutura de texto",
        "Argumentação",
        "Coesão e coerência"
      ]
    }
  },

  "questions": [
    {
      "id": "Q001",
      "category": "português",
      "subcategory": "Interpretação de Texto",
      "difficulty": "easy",
      "year": 2023,
      "text": "Leia o trecho abaixo e responda...",
      "options": [
        {"letter": "A", "text": "Opção A"},
        {"letter": "B", "text": "Opção B"},
        {"letter": "C", "text": "Opção C"},
        {"letter": "D", "text": "Opção D"},
        {"letter": "E", "text": "Opção E"}
      ],
      "correct_answer": "C",
      "explanation": "A resposta correta é C porque...",
      "tips": [
        "Dica 1 para estudar este tema",
        "Dica 2 para melhorar nesta área"
      ],
      "related_topics": ["Semantics", "Context clues"]
    },
    {
      "id": "Q002",
      "category": "matemática",
      "subcategory": "Geometria",
      "difficulty": "medium",
      "year": 2022,
      "text": "Um triângulo tem ângulos...",
      "options": [...],
      "correct_answer": "A",
      "explanation": "...",
      "tips": ["Fórmula da soma dos ângulos", "Use a Lei dos Cossenos"],
      "related_topics": ["Trigonometria"]
    }
    // 498 more questions...
  ],

  "tips_database": {
    "português": [
      "Sempre identifique o tema central antes de responder",
      "Preste atenção aos conectivos (mas, porém, contudo)"
    ],
    "matemática": [
      "Desenhe o problema quando possível",
      "Simplifique antes de calcular"
    ],
    // ... more tips for each category
  },

  "difficulty_distribution": {
    "easy": 167,
    "medium": 167,
    "hard": 166
  }
}
```

## Requirements

1. **Authenticity:** Questions follow ENEM format exactly
2. **Variety:** Mix of real ENEM questions (if available) and AI-generated realistic ones
3. **Completeness:** Each question has:
   - Clear text
   - 5 multiple choice options (A-E)
   - Correct answer marked
   - Explanation of why it's correct
   - 2-3 study tips
   - Related topics for cross-referencing
4. **Categorization:** Proper distribution across categories and difficulty levels
5. **Tips:** Actionable study advice for each question

## Return Format

Return ONLY valid JSON. No markdown, no explanation. Just the complete questions database as shown above.
