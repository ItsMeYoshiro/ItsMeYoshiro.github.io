---
title: Prova de estágio Tempest
date: 2024-06-29 00:02:12 +0300
categories: [Tempest]
tags: [tempest]     # TAG names should always be lowercase
---
# Prova de estágio Tempest

## Contexto

A prova de estágio da Tempest ocorreu até o dia 28/07 e uma das partes dela era necessário resolver um "mini CTF", em que, uma empresa denominada Quantum Nexys sofreu um ataque de Ransomware e procurou um time especializado para tentar reaver os dados de contratos, clientes e parceiros que foram roubados de seu servidor principal. Mas um arquivo em específico, era referente a uma patente que foi feita recentemente e que não havia backup. Dessa forma, foi apresentado o arquivo dessa patente criptografado em uma mensagem pgp:
![](https://i.imgur.com/uYE1qvH.png)

Além disso, também foi apresentado o link de um site em que os criminosos solicitavam um ID, que foi fornecido a empresa, e também o endereço da carteira digital que foi usada para efetuar o pagamento. Eles utilizavam desse método para verificar se o pagamento realmente foi efetuado e teoricamente, enviar a chave para descriptografar os arquivos.
![](https://i.imgur.com/jqZW24I.png)

![](https://i.imgur.com/BG3CoJ5.png)

## Enumeração

Eu havia feito a prova anterior da Tempest, e muitas informações valiosas já estavam disponíveis no código HTML, então, eu pulei as primeiras etapas que seriam: análise de portas abertas e diretórios.

Análisando o código, percebi no código javascript da página um redirecionamento de dados para uma API que estava em outro domínio.

![img](https://i.imgur.com/RxSyKuF.png)

Uma tela de login foi apresentada indo até o outro domínio, era o forúm dos criminosos.
![](https://i.imgur.com/hlQtWbK.png)

Uma das formas em que os sites utilizam para se proteger de robôs de buscas, é utilizando o robots.txt. Dessa forma, consegui verificar alguns diretórios que estavam disponíveis nesse forúm analisando o conteúdo deste arquivo.

![img](https://i.imgur.com/ZeApVAM.png)

Analisando logo o primeiro diretório (/api/), encontrei um arquivo .yaml, e neste arquivo estavam armazenadas as credenciais de um usuário do forúm que havia solicitado a alteração de senha.
![img](https://i.imgur.com/yxEFrt5.png)

Com essas credenciais, foi possível acessar o forúm.
![](https://i.imgur.com/aflV5iy.png)

Mas, havia um problema. Esse usuário não estava com permissões de vizualização do forúm, apenas de acesso.

Verificando o site via Burp Suit, consegui detectar que os cookies eram enviados em forma de base64 e, dessa forma, seria possível realizar alterações que resultariam no envenamento desses cookies.
![img](https://i.imgur.com/e1mnicM.png)

Analisando os cookies, para verificar quais informações eram passadas para que eu conseguisse altera-lo.
![](https://i.imgur.com/TuXCOFJ.png)

Alterei a opção de enabled de false para true, resultando em:
![](https://i.imgur.com/17bEkf4.png)

Alterando manualmente o cookie legítimo para o que foi envenenado, eu consegui visualizar o conteúdo do forúm.

![](https://i.imgur.com/jkj8kz6.png)

Nesse mesmo print, é possível identificar a empresa que foi vitíma do Ransoware e que nos contatou, e além de outras vitímas do forúm. Mas com esse usuário, não foi possível acessar o tópico do forúm.

![](https://i.imgur.com/d8woOSe.png)

## Escalonamento de privilégio

Dessa forma, será necessário escalonar para um usuário com permissão para acessar o tópico e conseguir mais informações a respeito do ataque. Navegando pelo forúm é possível encontrar o tópico de membros no menu. Nesse tópico, é listado todos os membros do forúm juntamente com suas permissões.

![](https://i.imgur.com/KzlkDVq.png)

Novamente, envenenei os cookies, mas dessa vez, com informações dos administrador do forúm alterando a parte de username e role. Dessa forma, consegui acesso ao tópico da empresa Quantum Nexys.

![](https://i.imgur.com/xYEvSaR.png)

Infelizmente, no tópico na empresa não foi possível encontrar a chave privada ou até mesmo informações que ajudasse a encontrar a chave privada para descriptografar a mensagem.

## Chave privada

Navegando pelo forúm, descobri que as chaves públicas dos usuários do forúm ficavam disponíveis nos seus perfis.

![](https://i.imgur.com/uufaEzn.png)

Guardem essa informação.

Procurando novamente pelos diretórios do forúm, encontrei o diretório das campanhas de Ransomware e acessando-o:
![](https://i.imgur.com/M036AdK.png)

Bom, encontrei uma pegadinha das pessoas que formularam o teste.

Análisei e percebi que toda vez solicitavamos as chaves públicas dos usuários, o sistema buscava pelo diretório das campanhas + id da empresa. Dessa forma, acessei esse diretório manualmente e percebi que as chaves públicas e privadas estavam realmente armazenadas lá.

![](https://i.imgur.com/k89bijH.png)
![](https://i.imgur.com/vlQMlZr.png)

Tentando acessar essas chaves a partir do diretório, o sistema sempre dava como não-autorizado mesmo envenenando os cookies como administrador ou como o usuário que fez o ataque.

![](https://i.imgur.com/p0Cpdu2.png)

Percebi então, que a única forma de conseguir a chave privada, era atráves do perfil do usuário quando ele solicitava a chave pública. A ideia era de que, se daquele meio, eu conseguia acesso a chave pública, eu também conseguiria acesso a chave privada apenas alterando o valor em que a url solicitava o arquivo id_pgp.pub para id.pgp. Também envenenei os cookies para o usuário do forúm que fez o ataque (não foi o administrador), dessa forma, o site deve me retornar a chave privada desse usuário destinada a esse ataque, já que cada ataque possui uma chave privada própria.

![](https://i.imgur.com/iwslMHr.png)
![](https://i.imgur.com/X6jgWqK.png)

E... voilà! Aqui estava a chave privada. Com ela, é possível descriptografar o arquivo da patente.

![](https://i.imgur.com/yfBKTNP.png)
![](https://i.imgur.com/rvisDlL.png)
