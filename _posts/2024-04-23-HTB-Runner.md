---
title: HTB Máquinas - Runner
date: 2024-04-23 13:30:12 +0300
categories: [HTB, Máquinas]
tags: [máquinas, htb]     # TAG names should always be lowercase
---

# Runner

## Enumeração
Nmap:
```
──(yoshiro㉿kali)-[~/htb/runner]
└─$ nmap 10.10.11.13 -A -sV -sC
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-04-22 13:48 -03
Nmap scan report for runner.htb (10.10.11.13)
Host is up (0.34s latency).
Not shown: 997 closed tcp ports (conn-refused)
PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 8.9p1 Ubuntu 3ubuntu0.6 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp   open  http        nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Runner - CI/CD Specialists
8000/tcp open  nagios-nsca Nagios NSCA
|_http-title: Site doesn't have a title (text/plain; charset=utf-8).
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 74.03 seconds
```

Jogando o IP no navegador, somos direcionados para um site que apresenta desenvolvedores especialiados em CI/CD. 
![](https://i.imgur.com/1TN6qyp.png)
 
Esse site em sí, não oferece oportunidades para um ataque, então procurei por subdomínios. Utilizei uma wordlist própria em que contém palavras chaves relacionadas ao desenvolvimento CI/CD e, junto com o vhost, foi possível encontrar o dominio *teamcity.runner.htb*.

Abaixo do login, é possível identificar a versão do TeamCity, sendo a  Version 2023.05.3 (build 129390). Pesquisando sobre, essa versão é vulneránel ao [CVE-2023-42793](https://www.exploit-db.com/exploits/51884).

## Explorando a vulnerabilidade

Utilizando o script, é possível gerar um login para acesso a plataforma.
![](https://i.imgur.com/r884cYc.png)

Após acessar, é possível identificar que a plataforma possuí backups, e nesses backups, é possível identificar uma chave de acesso.
![](https://i.imgur.com/cSNeD5z.png)
![](https://i.imgur.com/pMtNPJx.png)

Também é possível identificar alguns usuários na plataforma do TeamCity, levando a considerar que a chave de acesso é referente ao usuário matthew ou John.
![](https://i.imgur.com/bpX6Orx.png)

## User Flag

Consegui acesso ao usuário John pelo SSh e consegui a flag user.
![](https://i.imgur.com/WTQZLMd.png)

Verificando mais afundo, é possível identificar que existe outro domínio sobre o sistema, o *portainer-administration.runner.htb*.
![](https://i.imgur.com/uBNHBYw.png)

Procurando por mais informações nos arquivos de backup, é possível encontrar informações sobre as senhas criptografadas dos usuários do sistema.
![](https://i.imgur.com/ao1cCQw.png)

Utilizando o hashcat, é possível descriptografar a senha do matthew.
![](https://i.imgur.com/l8aT3a1.png)

## Root flag

Utilizando as credenciais do matthew, é possível acessar a plataforma de dockers do runners.htb.
![](https://i.imgur.com/rTLvYp1.png)

Vamos criar um container para que seja possível realizar comandos via command bash. Primeiramente, criaremos um volume com as seguinte configurações:
![](https://i.imgur.com/WWo1Ccy.png)

Depois, iremos criar um container com as seguintes configurações:
![](https://i.imgur.com/MgrMdAJ.png)
![](https://i.imgur.com/JCekQwo.png)
![](https://i.imgur.com/l5038j4.png)

Depois disso, iremos iniciar o container e iniciar um command bash e conseguir o acesso root.
![](https://i.imgur.com/Iibz6lN.png)