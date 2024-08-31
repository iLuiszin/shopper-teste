# Serviço de Leitura de Consumo de Água e Gás com IA

### Índice

<ul> 
  <a href="#descrição"><li>Descrição</li></a> 
  <a href="#instalação"><li>Instalação</li></a> 
  <a href="#configure-o-arquivo-env"><li>Configure o arquivo .env</li></a>
  <a href="#criação-do-banco-de-dados"><li>Criação do Banco de Dados</li></a> 
  <a href="#execução-da-aplicação"><li>Execução da Aplicação</li></a> 
  <a href="#testes"><li>Testes</li></a>
  <a href="#estrutura-do-projeto"><li>Estrutura do Projeto</li></a> 
</ul>

### Descrição

Este projeto é um serviço back-end que gerencia a leitura individualizada de consumo de água e gás. O serviço utiliza Inteligência Artificial (IA) para obter medições a partir de fotos de medidores. A aplicação foi desenvolvida com Node.js e TypeScript, utilizando Express para a construção da API e Prisma com SQLite para interação com o banco de dados. A aplicação está dockerizada para facilitar a configuração e execução do ambiente.

### Instalação

##### Clone o repositório:

```
$ git clone https://github.com/iLuiszin/shopper-teste.git
```

##### Acesse a pasta criada:

```
$ cd shopper-teste
```

##### Instale as dependências:

```
$ npm install
```

---

### Configure o arquivo .env

##### Adicione as configurações de variável de ambiente

```
Crie um arquivo .env na raiz do projeto e copie o conteúdo do arquivo .env.example para ele.
```

##### O arquivo .env deve conter:

```
GEMINI_API_KEY=<GEMINI API KEY>
PORT=<PORT>
```

### Criação do Banco de Dados

##### Inicialize o banco de dados SQLite:

```
$ npx prisma migrate dev --name "init"
```
Este comando irá criar o banco de dados SQLite (dev.db) e aplicar as migrações definidas no seu schema Prisma.

---

### Execução da Aplicação

##### Rodando com Docker:

```
$ docker compose up --build -d
```
Este comando constrói a imagem Docker e inicia todos os serviços definidos no `docker-compose.yml`. A aplicação estará disponível na porta 80.

##### Rodando localmente:

```
$ npm start
```

##### Acesse a documentação da API:

```
http://localhost:80/api-docs
```

---

### Testes

##### Inicie os testes:

```
$ npm test
```

---

### Estrutura do projeto

##### Tecnologias Utilizadas

<div style="display: inline_block"><br>

[![My Skills](https://skillicons.dev/icons?i=nodejs,express,mongodb,typescript,docker,jest)](https://skillicons.dev)

</div>

##### IDE Utilizada

<div>

[![My Skills](https://skillicons.dev/icons?i=vscode)](https://skillicons.dev)

</div>