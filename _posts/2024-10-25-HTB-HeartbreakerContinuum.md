---
title: HTB Sherlocks - Heartbreaker-Continuum 
date: 2024-10-25 13:00:12 +0300
categories: [HTB, Sherlocks]
tags: [sherlocks, htb]
---
# Heartbreaker-Continuum

Após um recente relatório de violação de dados na empresa, o cliente enviou um arquivo executável potencialmente malicioso. O arquivo se originou de um link em um e-mail de phishing recebido por um usuário vítima. Seu objetivo é analisar o binário para determinar sua funcionalidade e as possíveis consequências que ele pode ter na rede da empresa. Ao analisar a funcionalidade e as potenciais consequências desse binário, você poderá obter informações valiosas sobre o alcance da violação de dados e identificar se ele facilitou a exfiltração de dados. Compreender as capacidades do binário permitirá que você forneça ao cliente um relatório abrangente detalhando a metodologia do ataque, os dados potenciais em risco e as etapas recomendadas para mitigação.

## Task 1
*Para referenciar e identificar com precisão o binário suspeito, por favor forneça o hash SHA256 dele.*

Com o comando *sha256num* é possível identificar o hash do binário:
![](https://i.imgur.com/C5DnPIa.png)

R: 12DAA34111BB54B3DCBAD42305663E44E7E6C3842F015CCCBBE6564D9DFD3EA3

## Task 2
*Quando o arquivo binário foi originalmente criado, de acordo com seus metadados (UTC)?*

Para os próximos passos, usarei o PeStudio. O PeStudio é uma ferramenta de análise estática utilizada para examinar arquivos executáveis e permite a inspeção de executáveis sem a necessidade de executá-los. 

O PeStudio me deu a informação de quando o programa foi compilado no campo compiler-stamp:

![](https://i.imgur.com/jnaehNo.png)

R: 2024-03-13 10:38:06

## Task 3
*Examinar o tamanho do código em um arquivo binário pode fornecer indicações sobre sua funcionalidade. Você poderia especificar o tamanho em bytes do código neste binário?*

Análisando na aba optional-header > general > size-of-code, é possível identificar o tamanho de bytes do código:
![](https://i.imgur.com/0fcpXvC.png)

R: 38400

## Task 4
*Parece que o binário pode ter passado por um processo de conversão de arquivo. Você poderia determinar seu nome de arquivo original?*

Análisando na aba resources é possível identificar o nome do arquivo original, sendo ele, um script em powershell:
![](https://i.imgur.com/kzybuZS.png)

## Task 5
*Especifique o deslocamento hexadecimal onde o código ofuscado do arquivo original identificado começa no binário.* 

Para os próximos passos usarei o HxD, que é uma ferramenta de edição hexadecimal. Na minha análise identifiquei o começo do código ofuscado a partir do caractere *$*. O HxD apontou para o posição 2C74.

![](https://i.imgur.com/FOn1uhG.png)

R: 2C74

## Task 6
*O ator da ameaça ocultou o script em texto simples dentro do binário. Você pode fornecer o método de codificação usado para essa ofuscação?*

Da a entender que o código está em base64 pelo seu formato e também pelo uso do caractere igual (=).

Utilizei a ferramenta CyberChef para reverter o código oculto e, também para descriptografar o script.

![](https://i.imgur.com/XvTKOTd.png)
![](https://i.imgur.com/GfhiRh5.png)

R: Base64

## Task 7
*Qual é o cmdlet específico utilizado para iniciar downloads de arquivos?*

Análisando o script, é possível identificar logo nas primeiras linhas o comando *Invoke-WebRequest* que é utilizado para enviar solicitações HTTP e HTTPS para servidores web. Esse comando está acompanhado do -Uri que tem a finalidade de baixar arquivos.

![](https://i.imgur.com/vPaUbfG.png)

R: Invoke-WebRequest

## Task 8
*Você poderia identificar possíveis Indicadores de Compromisso (IoCs) relacionados à rede após examinar o código? Separe os IPs por vírgula e em ordem crescente.*

O termo indicadores de compromisso (IOC) abrange uma ampla variedade de dados, que podem ser usados para identificar atividades maliciosas dentro do sistema ou da rede. Análisando o script, é possível identificar dois endereços Ip's. Um está relacionado ao login de ftp para exfiltração de arquivos da vítima, e o outro está realizando o download do arquivo Superstart_MemberCard.tiff.        
![](https://i.imgur.com/lmKUKb4.png)
![](https://i.imgur.com/ikNK0EM.png)

R: 35.169.66.138,44.206.187.144

## Task 9
*O binário criou um diretório de preparação. Você pode especificar a localização desse diretório onde os arquivos coletados estão armazenados?*

Análisando o código é possível identitificar a pasta de arquivos coletados:
![](https://i.imgur.com/nvfbo0w.png)

R: C:\Users\Public\Public Files

## Task 10 
*Qual ID do MITRE corresponde à técnica usada pelo binário malicioso para coletar dados de forma autônoma?*

O mitre que corresponde a técnica é o Automated Collection:
![](https://i.imgur.com/hCfKXiU.png)

R: T1119

## Task 11
*Qual é a senha utilizada para exfiltrar os arquivos coletados através do programa de transferência de arquivos dentro do binário?*

Lembram do ip em que possui um servidor ftp para exfiltração de arquivos? Bem, para que a conexão seja efetuada, foi necessário informar a senha via comando.

![](https://i.imgur.com/KnWbZiu.png)

R: M8&C!i6KkmGL1-#