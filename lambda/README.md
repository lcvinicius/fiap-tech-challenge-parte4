# Sistema de Avaliação (Feedback)

Sistema de gerenciamento de feedbacks desenvolvido com Quarkus, um framework Java otimizado para Kubernetes.

## 🏗️ Arquitetura da Solução

A arquitetura utiliza serviços gerenciados da AWS, priorizando escalabilidade, desacoplamento e baixo custo operacional.

**Serviços Utilizados**

- Amazon API Gateway

    Exposição de um endpoint HTTP POST para recebimento dos feedbacks.

- AWS Lambda

    Processa a requisição, aplica regras de negócio, grava no banco e envia mensagens para a fila quando necessário.

- Amazon RDS (PostgreSQL)

    Armazena todos os feedbacks recebidos, independentemente do nível de urgência.

- Amazon SQS

    Recebe notificações apenas quando o feedback é considerado urgente.

- Amazon SNS

    Responsável por enviar notificações por e-mail a partir das mensagens urgentes.

- Amazon VPC

    Isola e protege a comunicação com o banco de dados (RDS).

## 🧱 Infraestrutura como Código (Terraform)

A infraestrutura do projeto é gerenciada via Terraform, organizada em arquivos com responsabilidades bem definidas:

- api_gateway.tf

    Cria e configura o API Gateway com método POST e integração com a Lambda.

- data.tf

    Consulta informações da conta, região e outros recursos existentes na AWS.

- iam_policy.tf

    Define as policies IAM e permissões necessárias para a Lambda acessar os serviços AWS.

- lambda.tf

    Cria a função Lambda, define runtime, variáveis de ambiente e integrações.

- locals.tf

    Centraliza valores locais reutilizáveis, como nomes, tags e padrões do projeto.

- main.tf

    Configura o provider e orquestra os recursos Terraform do projeto.

- outputs.tf

    Exporta informações importantes geradas após o deploy da infraestrutura.

- rds.tf

    Provisiona o banco de dados RDS PostgreSQL e suas configurações principais.

- security_group.tf

    Define os security groups para controlar o acesso entre Lambda, RDS e VPC.

- variables.tf

    Declara as variáveis utilizadas para customização do ambiente.

- vpc.tf

    Cria a VPC e subnets privadas necessárias para a comunicação segura com o RDS.

## 🚀 Pipeline de Deploy (GitHub Actions)

O deploy da infraestrutura é feito automaticamente através de uma GitHub Action, utilizando Terraform.

**Arquivo da Pipeline**

- .github/workflows/deploy-or-destroy.yml

Esse workflow é responsável por executar:

- terraform init

- terraform plan

- terraform apply ou terraform destroy, dependendo da variável configurada.

**Variável**: TF_ACTION

Para subir (provisionar) o projeto na AWS, é necessário:

1. Editar o arquivo:

`.github/workflows/deploy-or-destroy.yml`


2. Alterar a variável:

`TF_ACTION: apply`


3. Fazer commit da alteração.

Subir o commit na branch **develop**.

🔁 O pipeline será acionado automaticamente e realizará o deploy da infraestrutura.

Caso seja necessário destruir os recursos, basta alterar o valor para:

`TF_ACTION: destroy`


## 🔐 Autenticação com AWS via OIDC (GitHub Actions)

Este projeto utiliza OIDC (OpenID Connect) para autenticação segura entre o GitHub Actions e a AWS, eliminando a necessidade de armazenar credenciais estáticas (Access Key e Secret Key).

Como funciona

* O GitHub Actions assume uma IAM Role na AWS usando OIDC.
* Essa role possui permissões específicas para executar o Terraform.
* A autenticação ocorre de forma temporária e segura durante a execução da pipeline.

Benefícios do OIDC

* 🔒 Maior segurança (sem secrets sensíveis no repositório)
* ♻️ Credenciais temporárias
* 📋 Controle granular de permissões via IAM
* ✅ Padrão recomendado pela AWS

A configuração do OIDC envolve:

* Provider OIDC do GitHub na AWS
* IAM Role com trust policy para o repositório/branch
* Permissões necessárias para criação dos recursos via Terraform

## 🚀 Tecnologias Utilizadas

- **Quarkus 3.2.9** - Framework Java para aplicações nativas na nuvem
- **Java 17** - Versão LTS do Java
- **PostgreSQL** - Banco de dados relacional
- **AWS SQS** - Fila de mensagens para processamento assíncrono
- **Flyway** - Controle de versão de banco de dados
- **Maven** - Gerenciamento de dependências

## 📋 Pré-requisitos

- Java 17 ou superior
- Maven 3.9.0 ou superior
- Docker e Docker Compose (opcional, para execução em containers)
- Conta AWS (apenas se for usar SQS na nuvem)

## 🛠️ Configuração do Ambiente

1. **Banco de Dados**
   - Instale o PostgreSQL ou utilize o Docker Compose fornecido
   - Crie um banco de dados chamado `feedback`

2. **Variáveis de Ambiente**
   Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://localhost:5432/feedback
   QUARKUS_DATASOURCE_USERNAME=seu_usuario
   QUARKUS_DATASOURCE_PASSWORD=sua_senha
   SQS_QUEUE_URL=sua_url_da_fila_sqs
   ```

## 🚀 Executando a Aplicação

### Modo Desenvolvimento

```bash
./mvnw quarkus:dev
```

A aplicação estará disponível em: http://localhost:8081

### Usando Docker Compose

```bash
docker-compose up -d
```

### Construindo o Projeto

```bash
# Empacotar a aplicação
./mvnw package

# Construir imagem Docker
./mvnw package -Dquarkus.container-image.build=true
```

## 📚 Documentação e Testes - Postman

Todos os endpoints da API estão documentados seguindo boas práticas REST.
Arquivos de coleções do Postman estão disponíveis para testar os endpoints.

## 🌐 Endpoints da API

### Feedbacks

#### Criar um novo feedback
- **Método**: `POST`
- **Endpoint**: `/feedbacks`
- **Content-Type**: `application/json`
- **Exemplo de Request Body**:
  ```json
  {
      "descricao": "Ótimo, adorei!",
      "nota": 9.0
  }
  ```
- **Respostas**:
  - `201 Created`: Feedback criado com sucesso
  - `400 Bad Request`: Dados inválidos
  - `500 Internal Server Error`: Erro interno do servidor

### Hello World

#### Verificar se a API está online
- **Método**: `GET`
- **Endpoint**: `/hello`
- **Resposta**:
  - `200 OK`: "Hello from Quarkus REST"


### A documentação adicional via Quarkus Dev UI está disponível em [Quarkus Dev UI](http://localhost:8081/q/dev-ui/welcome)

## 🏗️ Estrutura do Projeto

```
src/
├── main/
│   ├── docker/           # Arquivos Docker
│   ├── java/
│   │   └── br/feedback/
│   │       ├── dto/      # Objetos de Transferência de Dados
│   │       ├── entity/   # Entidades JPA
│   │       ├── repository/ # Repositórios de acesso a dados
│   │       ├── resource/ # Controladores REST
│   │       └── service/  # Lógica de negócios
│   └── resources/
│       ├── db/migration/ # Scripts do Flyway
│       └── application.properties
└── test/                 # Testes automatizados
```

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Adicione suas mudanças (`git add .`)
4. Comite suas mudanças (`git commit -m 'Adicionando uma incrível feature'`)
5. Faça o Push da Branch (`git push origin feature/AmazingFeature`)
6. Abra um Pull Request

## 📄 Licença

Este projeto é parte de um desafio educacional da FIAP. Uso livre para fins acadêmicos. Ver MIT License para demais finalidades.

## ✨ Agradecimentos

- Equipe FIAP pelo desafio
- Comunidade Quarkus
- Toda a equipe que colaborou no desenvolvimento.
