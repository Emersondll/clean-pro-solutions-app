# Clean Pro Solutions - Mobile App 📱

A aplicação mobile da plataforma **Clean Pro Solutions** foi desenvolvida para conectar clientes a profissionais de limpeza de forma eficiente, segura e com uma experiência de usuário premium.

## ✨ Características Principais

- **Design Premium**: Interface moderna com tema Esmeralda, focada em "limpeza" visual e usabilidade.
- **Arquitetura Escalável**: Desenvolvido com React Native, Expo Router e Axios.
- **Integração BFF**: Todas as operações são centralizadas através do Backend for Frontend (BFF) para garantir performance e segurança.
- **Gestão de Sessão**: Autenticação robusta com JWT e refresh token automático.

---

## 📸 Demonstração das Telas

### 1. Acesso Seguro (Login)
![Tela de Login](./frontend/resources/docs/login.png)
Interface de login simplificada com validação em tempo real e integração com o serviço de autenticação via BFF.

---

### 2. Dashboard Inteligente (Home)
![Tela Inicial](./frontend/resources/docs/home.png)
Visão geral de serviços disponíveis, banners promocionais e acesso rápido às principais funcionalidades.

---

### 3. Gestão de Serviços (Jobs)
![Meus Trabalhos](./frontend/resources/docs/jobs.png)
Acompanhamento detalhado de todos os agendamentos com status visual (Pendente, Em Andamento, Concluído).

## ⚙️ Modos de Execução

A aplicação suporta dois modos de operação, controlados pelo arquivo `.env`:

### 1. Modo Simulado (Mock) - Ideal para Testes de UI/UX
Permite navegar por todas as telas e testar a lógica do App sem precisar que o backend esteja rodando.
- **Configuração**: No arquivo `.env`, defina `EXPO_PUBLIC_USE_MOCKS=true`.
- **Funcionalidades**: Login simulado, listagem de serviços e trabalhos com dados de exemplo, e sucesso automático em ações (POST/PUT).

### 2. Modo Real (Backend/BFF)
Conecta o App aos microsserviços através do BFF.
- **Configuração**: No arquivo `.env`, defina `EXPO_PUBLIC_USE_MOCKS=false`.
- **Requisito**: Os serviços Docker do backend devem estar ativos (`docker-compose up`).

---

### 4. Área do Usuário (Profile)
![Perfil do Usuário](./frontend/resources/docs/profile.png)
Controle total sobre dados pessoais, endereços, segurança e preferências do aplicativo.

---

## 🛠️ Tecnologias e Decisões Técnicas

- **Framework**: [Expo](https://expo.dev/) (React Native 0.79)
- **API Client**: [Native Fetch API](https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API)
  - *Nota*: Optamos pelo `fetch` nativo em vez de Axios para garantir 100% de compatibilidade com ambientes mobile/web modernos e evitar problemas de dependências Node-only (como `follow-redirects`).
- **Roteamento**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based)
- **Estilização**: Sistema de design proprietário baseado em tokens (Emerald Theme).
- **Storage**: AsyncStorage para persistência de tokens JWT e perfil do usuário.

---

## 🚀 Como Executar o Projeto

1. **Instalação**:
   Navegue até a pasta `frontend` e instale as dependências:
   ```bash
   npm install
   ```

2. **Configuração**:
   Verifique o arquivo `.env` para garantir que `EXPO_PUBLIC_BACKEND_URL` aponta para o endereço correto do BFF.

3. **Execução**:
   Inicie o servidor de desenvolvimento do Expo:
   ```bash
   npm run start
   ```

---

## 🏗️ Estrutura do Projeto

- `/app`: Rotas e layouts da aplicação (Expo Router).
- `/src/components`: Componentes de interface reutilizáveis.
- `/src/context`: Gerenciamento de estado global (Auth).
- `/src/services`: Configuração do cliente API e interceptors.
- `/src/theme`: Definições de cores, espaçamentos e sombras.
- `/src/hooks`: Lógica de negócio e chamadas de API encapsuladas.

---

Desenvolvido com ❤️ pela equipe Clean Pro Solutions.
