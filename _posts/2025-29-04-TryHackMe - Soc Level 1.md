---
title: TryHackMe - Soc Level 1
date: 2025-04-25 13:00:12 +0300
categories: []
tags: []     # TAG names should always be lowercase
---
## Contexto
Essa sala tem como objetivo preparar analistas SOC de nível 1 abordando cenários em que os analistas L1 enfrentam ataques reais que exigem resposta imediata e ações de remediação. Para isso, a sala introduz três conceitos fundamentais: relato de alertas (alert reporting), escalonamento (escalation) e comunicação (communication). Nela, vamos aprender a importância do relato e do escalonamento de alertas, como escrever comentários ou relatórios de casos de forma profissional, métodos eficazes de escalonamento e boas práticas de comunicação.

## Task 2

"Na sala anterior, você aprendeu como classificar e fazer a triagem dos alertas. Mas talvez esteja curioso sobre o que acontece depois disso. Como a sua triagem ajuda a prevenir ameaças e impedir invasões? Esse é um novo tópico que será abordado em breve nesta sala, mas, por enquanto, vamos relembrar o caminho dos alertas.

Primeiro, os analistas L1 recebem os alertas em plataformas como SIEM, EDR ou sistemas de gerenciamento de tickets. A maioria dos alertas é encerrada como falso positivo ou resolvida no próprio nível L1, mas os casos mais complexos e ameaçadores são encaminhados para o L2, que é responsável por remediar a maioria das violações. E para encaminhar os alertas adiante, é preciso aprender três novos termos: relato (reporting), escalonamento (escalation) e comunicação (communication).

É como um funil: o L1 lida com 100 alertas, escalona 10 positivos reais (True Positives) para o L2, e apenas 1 deles acaba exigindo uma resposta forense e de investigação (DFIR) no final.
![](https://tryhackme-images.s3.amazonaws.com/user-uploads/678ecc92c80aa206339f0f23/room-content/678ecc92c80aa206339f0f23-1743606354595.svg)

**Relato de Alertas (Alert Reporting)**

Antes de encerrar ou encaminhar o alerta para o L2, você pode precisar reportá-lo. Dependendo dos padrões da equipe e da gravidade do alerta, em vez de apenas um comentário breve, pode ser necessário documentar sua investigação com detalhes, garantindo que todas as evidências relevantes estejam incluídas. Isso é especialmente importante para os True Positives (positivos reais), que exigem escalonamento.

**Escalonamento de Alertas (Alert Escalation)**

Se um alerta classificado como True Positive exigir ações adicionais ou uma investigação mais profunda, ele deve ser escalonado para um analista L2, seguindo os procedimentos acordados. É nesse momento que o seu relatório de alerta é útil, pois o L2 irá utilizá-lo para obter o contexto inicial e gastar menos tempo começando a análise do zero.

**Comunicação (Communication)**

Você também pode precisar se comunicar com outros departamentos durante ou após a análise. Por exemplo, perguntar à equipe de TI se confirmam a concessão de privilégios administrativos a determinados usuários ou entrar em contato com o RH para obter mais informações sobre um funcionário recém-contratado."

**Qual é o processo de encaminhar alertas suspeitos para um analista L2 revisar?**

R:Alert [Redacted]

**Qual é o processo de descrever formalmente os detalhes do alerta e as descobertas?**

R: Alert [Redacted]

## Task 3

Antes de seguirmos em frente, é essencial esclarecer por que alguém gostaria que analistas L1 escrevessem relatórios, além de apenas marcar os alertas como True ou False Positives, e por que esse tópico não pode ser subestimado. Fazer com que analistas L1 escrevam relatórios de alertas serve a vários propósitos importantes:

| **Finalidade do Relatório de Alerta** | Explicação                                                                                                                                                                                                      |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fornecer contexto para escalonamento         | - Um relatório bem escrito economiza muito tempo dos analistas L2<br />- Também os ajuda a entender rapidamente o que aconteceu                                                                                 |
| Salvar descobertas para registro             | - Os logs brutos do SIEM são armazenados por 3 a 12 meses, mas os alertas são mantidos indefinidamente<br />- Por isso, é melhor manter todo o contexto dentro do alerta, por precaução                      |
| Melhorar as habilidades de investigação    | - Se você não consegue explicar de forma simples, é porque não entende bem o suficiente<br />- Escrever relatórios é uma ótima forma de desenvolver as habilidades dos analistas L1 ao resumir os alertas |

Imagine-se como um analista L2, membro da equipe de DFIR ou profissional de TI que precisa entender o alerta. O que você gostaria de ver no relatório? Recomendamos seguir a abordagem dos Cinco Qs (Five Ws) e incluir pelo menos os seguintes itens no relatório:

Quem (Who): Qual usuário fez login, executou o comando ou baixou o arquivo

O quê (What): Qual ação exata ou sequência de eventos foi realizada

Quando (When): Quando exatamente a atividade suspeita começou e terminou

Onde (Where): Qual dispositivo, IP ou site esteve envolvido no alerta

Por quê (Why): O mais importante dos Qs — o raciocínio por trás do seu veredito final

**De acordo com o dashboard SOC, qual e-mail de usuário vazou o documento sensível?**

O dashboard está disponível no link **https://static-labs.tryhackme.cloud/apps/socl1-alertreporting/**. Acessando-o, somos apresentados a um simulador de SIEM projetado pelo THM com alguns alertas.
![](https://i.imgur.com/HNGwOlA.png)
Verificando o alerta "Sensitive Document Share to External", podemos encontrar a resposta para a questão:
![](https://i.imgur.com/x7R60RA.png)

**Analisando os novos alertas, quem é o 'remetente' do e-mail suspeito, provavelmente de phishing?**
Verificando o alerta "Email Marked as Phishing after Delivery", podemos encontrar a resposta para a questão:
![](https://i.imgur.com/IiLhL75.png)

**Abra o alerta de phishing, leia os detalhes e tente entender a atividade.
Usando o modelo dos Cinco Porquês (Five Ws), qual foi a flag que você recebeu após escrever um bom relatório?**

Verificando o alerta do e-mail de phishing, podemos analisar os 5 porquês, sendo eles:

**1 - Quem?**

-Microsoft Support: support@microsoft.com. Apesar de parecer legítimo, é um endereço falsificado (spoofed).

-Eddie Huffman, IT Manager e.huffman@tryhackme.thm. Alvo com acesso privilegiado.

**2 - O quê?**

-Um e-mail de  **phishing**, contendo:

* Linguagem alarmante (ex:  *"600% price increase"* , *"urgent notice")*
* Um anexo chamado  **REPORT.rar** , potencialmente malicioso
* Falha nas verificações **SPF** e **DKIM**.

**3 - Quando?**

-27 de março de 2025 às 19h25.

**4 - Onde?**

-O ataque ocorreu via  **e-mail corporativo**, direcionado para um gerente de TI, potencialmente expondo a rede interna.

**5 - Por quê?**

-Provavelmente para:

* Induzir o usuário a abrir o anexo malicioso
* Explorar sua posição na empresa para obter acesso à rede
* Roubar credenciais, instalar malware ou ransomware

Com essas informações, desenvolvi o seguinte relatório para o alerta:

> Phishing identificado em 27/03/2025 às 19:25 - E-mail enviado de support@microsoft.com para Eddie Huffman (IT Manager), com tentativa de engenharia social explorando urgência relacionada a um suposto aumento no preço do Microsoft Teams. E-mail continha anexo malicioso em formato .rar. Cabeçalhos indicam falha nas validações de autenticação: SPF/Fail; DKIM/Fail. Indicativo de spoofing e potencial campanha de phishing com entrega de malware.

Também preenchi o alerta da seguinte forma:

![](https://i.imgur.com/GJnODBc.png)

Dessa forma, foi possível conseguir a flag.

## Task 4

Depois de chegar a um veredito e escrever seu relatório de alerta, você deve decidir se o alerta precisa ser escalonado para o L2. Novamente, a resposta pode variar de equipe para equipe, mas as seguintes recomendações geralmente se aplicam à maioria dos times SOC. Você deve escalar os alertas se:

1. O alerta for um indicativo de um grande ciberataque que exija investigação mais profunda ou DFIR
2. Ações de remediação, como remoção de malware, isolamento de host ou redefinição de senha forem necessárias
3. For necessária comunicação com clientes, parceiros, gestão ou órgãos legais
4. Você simplesmente não entende totalmente o alerta e precisa de ajuda de analistas mais experientes

**Etapas de Escalonamento**

Para escalar um alerta, na maioria dos casos, tudo o que você precisa fazer é reatribuir o alerta para o L2 de plantão e notificá-lo via chat corporativo ou pessoalmente. No entanto, em algumas equipes, pode ser necessário preencher uma solicitação formal de escalonamento com dezenas de campos obrigatórios.

Independentemente do processo adotado, o L2 acabará recebendo o ticket, lendo o seu relatório e entrando em contato com você caso tenha dúvidas. Uma vez que tudo esteja claro, o analista L2 normalmente irá aprofundar a investigação do alerta, validar se ele é de fato um True Positive, comunicar-se com outros departamentos, se necessário, e, em casos graves, iniciar um processo formal de Resposta a Incidentes.

Procedimento de Escalonamento no Painel SOC

1. Escreva um relatório do alerta e forneça seu veredito; mova o alerta para o status Em andamento (In Progress)
2. Atribua o alerta ao L2 de plantão. O L2 receberá uma notificação e começará a partir do seu relatório

**Escalonando Ameaças para o L2**
![](https://tryhackme-images.s3.amazonaws.com/user-uploads/678ecc92c80aa206339f0f23/room-content/678ecc92c80aa206339f0f23-1743520297119.svg)

**Solicitando Suporte do L2**
![](https://tryhackme-images.s3.amazonaws.com/user-uploads/678ecc92c80aa206339f0f23/room-content/678ecc92c80aa206339f0f23-1743520519371.svg)

**Quem é o seu atual analista L2 no painel do SOC para quem você pode atribuir (escalonar) os alertas?**

Verificando as assinaturas disponiveís no simulador do SIEM, é possível identificar quem é o L2.

![](https://i.imgur.com/Ky0E45b.png)

**Qual foi a flag que você recebeu após escalonar corretamente o alerta da tarefa anterior para o L2? Nota: Se você já escalonou corretamente o alerta anteriormente, basta editar o alerta e clicar em "Salvar" novamente.**

Voltando novamente ao alerta de phishing, é possível conseguir a flag realizando a edição do alerta da seguinte forma:
![](https://i.imgur.com/EafFwsw.png)

**Agora, investigue o segundo novo alerta na fila e forneça um comentário detalhado sobre o alerta. Em seguida, decida se é necessário escalonar esse alerta e siga o processo conforme indicado. Após concluir sua triagem, você deverá receber uma flag, que será a sua resposta!**

Analisando o alerta "Spike of Domain Discovery Commands" é possível encontrar as informações que precisamos para desenvolver nosso relatório.

**1 - Quem?**
-NT AUTHORITY\SYSTEM. A atividade está sendo executada com permissões de sistema, o que indica que o processo tem acesso elevado e pode ter controle total sobre o sistema.
-Processos envolvidos:

1. cmd.exe
2. revshell.exe

**2 - O quê?**
-Foi detectada uma sequência de comandos suspeitos (whoami, net user, Get-ADUser, etc.), frequentemente associada a descoberta de domínio Active Directory (AD), o que indica que a máquina pode estar sendo reconhecida por um atacante para mapear o ambiente AD. A atividade foi originada de um processo não autorizado (revshell.exe), indicando um possível acesso remoto indevido.

**3 - Quando?**
-27 de março de 2025, às 19h56.

**4 - Onde?**
-O alerta ocorreu no servidor DMZ-MSEXCHANGE-2013.
-O sistema operacional é Windows Server 2012 R2, o que pode ser importante para avaliar vulnerabilidades conhecidas desse SO.

**5 - Por quê?**
-O uso de comandos típicos de descoberta de AD (como net user, whoami, nltest) pode indicar que um invasor está tentando mapear a rede e encontrar informações sensíveis, como contas de administrador ou outros dados de acesso. O fato de o processo ter sido iniciado por um script revshell.exe sugere que pode haver controle remoto malicioso em andamento, possivelmente com a intenção de comprometer ainda mais a rede ou exfiltrar dados.

Com essas informações, desenvolvi o seguinte relatório para o alerta:

> No dia 27/03/2025, foi detectado no host DMZ-MSEXCHANGE-2013, um padrão de comandos  associados a atividades de recon em ambientes Active Directory. Entre os comandos executados estão: dir, hostname, whoami /priv, net group "Domain Admins" /domain e nltest /dclist:tryhackme.thm. Essa atividade foi executada sob o contexto do usuário NT AUTHORITY\SYSTEM, através do processo cmd.exe, iniciado pelo executável revshell.exe, cujo processo pai é w3wp.exe, indicando um possível comprometimento do servidor via shell reversa.

Escalonei o alerta para L2, da seguinte forma:
![](https://i.imgur.com/EBuQoji.png)

Dessa forma, conseguir a flag.

Caso você discorde, ou queira adicionar algo a esse artigo, você pode me chamar no linkedin para que possamos conversar! https://www.linkedin.com/in/kaiobarbosa/ .