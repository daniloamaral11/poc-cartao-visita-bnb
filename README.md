# POC Cartão de Visita Digital — Liferay DXP

Cadastro de colaboradores que gera um cartão de visita com página própria,
exportação em PNG e link compartilhável. Construído apenas com recursos
nativos: Objects, Fragments, Collections e Display Page Templates.

Sem módulo OSGi, sem client extension, sem biblioteca externa.

## Comece por aqui

Abra **GUIA.html** no navegador. É o passo a passo completo, com as
armadilhas que custaram tempo na construção original.

## Conteúdo

| Caminho | O que é |
|---|---|
| `GUIA.html` | Guia de replicação, 10 passos |
| `fragments/bnb-fragments.zip` | Fragment set pronto para importar na interface |
| `fragments/bnb/` | Fonte versionável do set, para entrar no seu git |

## Ordem de execução

Tudo pela interface do Liferay, sem linha de comando.

1. Picklist `Unidade` — *Objects → Picklists*
2. Object `Cartao`, scope Site — *Objects → New Object*
3. **Permissão de Guest nas entradas** — *Control Panel → Roles → Guest → Define Permissions*
4. Importar `fragments/bnb-fragments.zip` — *Design → Fragments → Import*
5. Display Page Template + **Mark as Default** — *Design → Page Templates*
6. Página de cadastro, Success Action `Go to Entry Display Page`
7. Collection + página da galeria
8. Cadastrar alguns exemplos e verificar em janela anônima

Os passos 3 e 5 são os que mais travam. O detalhe de cada um está no guia.

## Requisitos

Liferay DXP 2025.Q1 ou 7.4 U92+, com perfil de administrador do site.
Construído e verificado em DXP 2025.Q1.17 LTS.

## O que falta para produção

Política de retenção de telefone e e-mail, validação de formato, fluxo de
aprovação antes de publicar e internacionalização. Nada disso muda a
arquitetura — são regras a mais sobre o que já existe.
