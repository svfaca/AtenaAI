# Roadmap - AtenaAI

## 🎯 Visão Geral

Transformar a AtenaAI de um assistente para estudantes independentes para uma plataforma educacional completa, conectando professores, instituições e alunos (em turmas) em um ecossistema inteligente de aprendizado.

---

## 📌 Terminologia

- **📚 Estudante**: Usuário independente que estuda sozinho, interage privativamente com a IA
- **🎓 Aluno**: Usuário matriculado em uma turma, faz parte de uma comunidade de aprendizado com colegas, professores e IA
- **👨‍🏫 Professor**: Gerencia turmas, recebe feedbacks personalizados sobre alunos, customiza a IA
- **🏫 Instituição**: Gerencia múltiplos professores, turmas e alunos em um nível centralizado

---

## 📅 Versão 2.0 - Sistema de Turmas (Q2 2026)

### Funcionalidades Principais

#### 👨‍🏫 Modo Professor
- [ ] Dashboard de professor
- [ ] Criação e gerenciamento de turmas
- [ ] Sistema de convites para alunos (email/código)
- [ ] Visualização de lista de alunos por turma
- [ ] Configuração de objetivos pedagógicos por turma

#### 🎓 Modo Aluno (Matriculado em Turma)
- [ ] Acesso mediante convite (professor/instituição)
- [ ] Perfil de aluno vinculado a turmas
- [ ] Visualização de turmas matriculadas
- [ ] Aceitação/recusa de convites

#### 💬 Sistema de Chat Colaborativo
- [ ] **Chat Geral da Turma**
  - Alunos, professores e IA em um único espaço
  - Mensagens em tempo real (WebSocket)
  - Histórico de conversas da turma
  - Notificações de novas mensagens
  
- [ ] **Chats Individuais**
  - Aluno ↔ IA (privado)
  - Aluno ↔ Professor (privado)
  - Aluno ↔ Aluno (privado)

#### 🤖 IA Customizável
- [ ] Prompt base configurável por professor
- [ ] Ajuste de tom e nível de complexidade
- [ ] Definição de áreas de foco por turma
- [ ] Templates de prompts predefinidos

---

## 📅 Versão 2.5 - Feedbacks e Analytics (Q3 2026)

### 👨‍🏫 Feedbacks para Professores
- [ ] Dashboard de analytics por aluno
- [ ] Relatórios de progresso individuais
- [ ] Insights da IA sobre dificuldades dos alunos
- [ ] Sugestões de intervenção pedagógica
- [ ] Análise de engajamento e participação
- [ ] Identificação de padrões de aprendizado

### 📊 Métricas Disponíveis
- Frequência de uso da plataforma
- Tópicos mais consultados
- Evolução do desempenho
- Tempo médio de sessão
- Dúvidas mais frequentes
- Comparativo de progresso da turma

---

## 📅 Versão 3.0 - Modo Instituição (Q4 2026)

### 🏫 Gestão Institucional
- [ ] Painel administrativo central
- [ ] Gerenciamento de múltiplos professores
- [ ] Visão consolidada de todas as turmas
- [ ] Relatórios institucionais
- [ ] Analytics de toda a instituição
- [ ] Configuração global da IA

### 🔐 Controle de Acesso
- [ ] Hierarquia: Instituição > Professor > Aluno
- [ ] Permissões e roles customizáveis
- [ ] Aprovação de professores
- [ ] Políticas de uso e privacidade

---

## 📅 Versão 3.5 - Recursos Avançados (Q1 2027)

### 📚 Biblioteca de Recursos
- [ ] Upload e compartilhamento de materiais
- [ ] Organização por disciplina/turma
- [ ] Pesquisa e filtros avançados
- [ ] Versionamento de documentos

### 📝 Sistema de Avaliações
- [ ] Criação de questionários
- [ ] Correção automática com IA
- [ ] Banco de questões
- [ ] Notas e feedback automatizado
- [ ] Exportação de resultados

### 🏆 Gamificação
- [ ] Sistema de pontos e XP
- [ ] Badges de conquistas
- [ ] Rankings por turma
- [ ] Desafios semanais
- [ ] Recompensas virtuais

---

## 📅 Versão 4.0 - Expansão (Q2 2027)

### 📱 Aplicativo Mobile
- [ ] Versão iOS nativa
- [ ] Versão Android nativa
- [ ] Notificações push
- [ ] Sincronização em tempo real
- [ ] Interface otimizada para mobile

### 📹 Videoconferência
- [ ] Aulas ao vivo integradas
- [ ] Gravação de sessões
- [ ] Compartilhamento de tela
- [ ] Breakout rooms

### 🌐 Funcionalidades Extras
- [ ] Modo offline (cache local)
- [ ] Exportar conversas (PDF/TXT)
- [ ] Integração com Google Classroom
- [ ] Integração com Microsoft Teams
- [ ] API pública para desenvolvedores
- [ ] Temas customizáveis
- [ ] Suporte multilíngue

---

## 🛠️ Melhorias Técnicas Contínuas

### Backend
- [ ] Migração para PostgreSQL
- [ ] Implementação de cache (Redis)
- [ ] WebSockets para chat em tempo real
- [ ] Sistema de filas (Celery)
- [ ] Testes automatizados (95%+ cobertura)
- [ ] CI/CD pipeline
- [ ] Monitoramento e logs centralizados

### Frontend
- [ ] Migração para React/Vue
- [ ] Progressive Web App (PWA)
- [ ] Lazy loading de componentes
- [ ] Otimização de bundle
- [ ] Acessibilidade (WCAG 2.1 AA)
- [ ] Testes E2E (Playwright/Cypress)

### Infraestrutura
- [ ] Deploy em Docker containers
- [ ] Kubernetes para orquestração
- [ ] Load balancing
- [ ] CDN para assets estáticos
- [ ] Backup automatizado
- [ ] Disaster recovery

---

## 🎯 KPIs e Objetivos

### Até V2.0
- 100+ professores ativos
- 1000+ alunos cadastrados (matriculados em turmas)
- 50+ turmas criadas
- 10000+ estudantes independentes usando modo estudante

### Até V3.0
- 10+ instituições parceiras
- 5000+ alunos em turmas ativos
- 50000+ estudantes independentes
- 95%+ uptime

### Até V4.0
- 50+ instituições
- 100000+ usuários totais (alunos + estudantes)
- App com nota 4.5+ nas lojas

---

## 💡 Ideias Futuras (Backlog)

- Assistente de voz (integração Whisper)
- Geração de resumos automáticos de aulas
- Recomendação inteligente de conteúdos
- Sistema de mentoria peer-to-peer
- Marketplace de cursos e materiais
- Certificações e badges verificáveis (blockchain)
- IA para detectar plágio
- Análise de sentimento nas conversas
- Suporte a realidade aumentada (AR) para disciplinas práticas

---

## 🤝 Como Contribuir

Interessado em trabalhar em alguma dessas features? Veja nosso [CONTRIBUTING.md](CONTRIBUTING.md) para começar!

**Prioridade Alta**: Itens marcados com ⭐
**Em Progresso**: Itens com 🚧
**Concluído**: Itens com ✅

---

> 📌 Este roadmap é um documento vivo e pode ser atualizado conforme o feedback da comunidade e necessidades do mercado.

**Última atualização**: Janeiro 2026
