---
title: HTB Sherlocks - Meerkat
date: 2024-04-18 09:47:12 +0300
categories: [HTB, Sherlocks]
tags: [sherlocks, htb]     # TAG names should always be lowercase
---

# Meerkat

## Task 1
*Acreditamos que o servidor da nossa Plataforma de Gestão Empresarial foi comprometido. Você pode confirmar o nome do aplicativo em execução?*

Antes de tudo, é possível observar que o host local é o 172.31.6.44 e que, está recebendo muito tráfego vindo dos IP's 54.144.148.213, 156.146.62.213, 138.199.59.221 e 95.181.232.30.

Aplicando um filtro de tcp para a porta 8080 e para o host local e foi possível perceber que o aplicativo em execução é o BonitaSoft por conta das solicitações GET e POST que foram apresentadas.

R: BonitaSoft
![](https://i.imgur.com/qTru7jF.png)

## Task 2
*Acreditamos que o invasor pode ter usado um subconjunto da categoria de ataque de força bruta – qual é o nome do ataque realizado?*

Análisando as solicitações POST que foram realizadas no host, é possível perceber que o atacante está utilizando um método de força bruta baseado em injeção de credenciais.

R: Credential Stuffing

![](https://i.imgur.com/xtNGrYp.png)

## Task 3
*A vulnerabilidade explorada possui um CVE atribuído? Se sim, qual?*

Analisando o JSON é possível identificar que o atacante utilizou o CVE-2022-25237 para tentar conseguir acesso a aplicação com uma exploit provido do bonitasoft.

R: CVE-2022-25237

![](https://i.imgur.com/wZxr9Vk.png)

## Task 4
*Qual string foi anexada ao caminho do URL da API para ignorar o filtro de autorização da exploração do invasor?*

Lendo sobre a vulnerabilidadae [CVE-2022-25237](https://rhinosecuritylabs.com/application-security/cve-2022-25237-bonitasoft-authorization-bypass/), é possível identificar que ela funciona adicionando "i18ntranslation" em uma das duas variações da URL.

R: i18ntranslation

![](https://rhinosecuritylabs.com/wp-content/uploads/2022/05/1.png)

## Task 5
*Quantas combinações de nomes de usuário e senhas foram usadas no ataque de preenchimento de credenciais?*

Apliquei o filtro http.request.method == "POST" e analisei quantas requisições únicas foram feitas.

R: 56

![](https://i.imgur.com/IgA2VIM.png)

## Task 6 
*Qual combinação de nome de usuário e senha foi bem-sucedida?*
Análisando a última requisição do filtro aplicado anteriormente, foi possível identificar o usuário e senha.

R: seb.broom@forela.co.uk:g0vernm3nt

![](https://i.imgur.com/itHdrlF.png)

## Task 7
*Se houver, qual site de compartilhamento de texto o invasor utilizou?*

Análisando o pacote 3652 com o método GET, foi possível identificar que o atacante utilizou o pastes.io.

R: pastes.io

![](https://i.imgur.com/3Kw5Fkc.png)

## Task 8
*Forneça o nome do arquivo da chave pública usada pelo invasor para obter persistência em nosso host.*

Análisando o script em que o atacante fez o upload em https://pastebin.ai/raw/bx5gcr0et8, é possível identificar que o nome do arquivo é hffgra4unv.

R: hffgra4unv

![](https://i.imgur.com/mQZAfIg.png)

## Task 9
*Você pode confirmar o arquivo modificado pelo invasor para ganhar persistência?*

Análisandoo script Análisando o script em que o atacante fez o upload em https://pastebin.ai/raw/bx5gcr0et8, é possível identificar que o nome do arquivo modificado pelo atacante é /home/ubuntu/.ssh/authorized_keys.

R: /home/ubuntu/.ssh/authorized_keys

![](https://i.imgur.com/mQZAfIg.png)

## Task 10
*Você pode confirmar o ID da técnica MITRE deste tipo de mecanismo de persistência?*

Anaĺisando a Matrix do MITRE ATT&CK, identifiquei um TTP que corresponde às ações do invasor: Chaves autorizadas SSH (T1098.004) em Manipulação de conta na coluna Persistência.

R: T1098.004

![](https://i.imgur.com/GZt6qHu.png)