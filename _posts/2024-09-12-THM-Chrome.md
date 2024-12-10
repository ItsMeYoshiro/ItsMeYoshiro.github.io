---
title: THM - Chrome
date: 2024-12-09 19:00:12 +0300
categories: [THM, hard]
tags: [THM, hard]
---

# Contexto
Um agente malicioso entrou na rede e extraiu algo, mas a pergunta é: o que exatamente?

## Analisando os pacotes.

A princípio, foi disponibilizado um pacote de rede para que seja realizada a análise do mesmo. Utilizando o Wireshark, podemos perceber que, em um primeiro momento, a maioria do tráfego ocorre através do protocolo SMB. O SMB é um protocolo de comunicação que permite o compartilhamento de arquivos, ou seja, ocorreu algum tráfego de arquivos na rede.

![](https://i.imgur.com/Yv1gxX3.png)

Utilizando a opção de exportar objetos através do protocolo SMB, é possível identificar que houve a comunicação de dois arquivos interessantes: o transfer.exe e o encrypted_files.
![](https://i.imgur.com/oHMhATI.png)

## Engenharia reversa.

Analisando o arquivo transfer.exe, foi possível identificar que ele foi compilado utilizando .NET Assembly. Após uma rápida pesquisa, encontrei a ferramenta [ILSpy](https://github.com/icsharpcode/ILSpy), que auxiliará na descompilação do .exe
![](https://i.imgur.com/x3aQ9PF.png)

Com a ferramenta, foi possível acessar o código-fonte e, com isso, detectar que são declaradas duas matrizes de bytes e, em seguida, são utilizadas como chave e IV para a criptografia AES, utilizando o UTF-8. O atacante utiliza esse método para criptografar o arquivo files.zip e, depois, o transforma no arquivo encrypted_files, que foi extraído anteriormente utilizando o Wireshark.
![](https://i.imgur.com/ayYg9KU.png)

Com essas informações, consegui descriptografar o arquivo encrypted_files utilizando o CyberChef, com os dados encontrados durante a engenharia reversa.
![](https://i.imgur.com/IdqNVM1.png)

## Analisando o .zip descompactado.

Descompactando o arquivo files.zip, foi possível perceber que o agente malicioso extraiu da rede arquivos relacionados do Google Chrome. 

O Google Chrome utiliza a DPAPI em conjunto com o AES-256 para criptografar os dados. Nesse contexto, as senhas criptografadas podem ser encontradas no arquivo Login Data, localizado em /AppData/Local/Google/Chrome/User Data/Default. A criptografia das senhas é realizada com uma chave armazenada no arquivo Local State, que está localizado em AppData/Local/Google/Chrome/User Data.

Ao consultar a documentação da Microsoft sobre a DPAPI, é possível verificar que a chave armazenada no arquivo Local State, usada para a descriptografação, é a master key do usuário, que, por sua vez, é criptografada com a senha do próprio usuário. Vale destacar que a master key, responsável por criptografar os dados protegidos pela DPAPI, pode ser localizada no diretório AppData/Roaming/Microsoft/Protect/SID

Dessa forma, vai se construindo um caminho em que, para que seja possível visualizar os logins que estão armazenados, é necessário:  
1) Descobrir a senha local do usuário.
2) Usar a senha local para descriptografar a master key.
3) Utilizar a master key para descriptografar os logins armazenados.

## Descriptografando a senha do usuário.
Será necessário utilizar o dpapimk2john para extrair a hash da senha para que o john consiga descriptografar.

```
DPAPImk2john -mk AppData/Roaming/Microsoft/Protect/S-1-5-21-3854677062-280096443-3674533662-1001/8c6b6187-8eaa-48bd-be16-98212a441580 -c local -S S-1-5-21-3854677062-280096443-3674533662-1001 > hash.txt
```

Dessa forma, é possível realizar o bruteforce na senha:
![](https://i.imgur.com/Oq2kBAH.png)

## Descriptografando a master key.

Para avançarmos, será necessário o uso da ferramenta [mimikatz](https://github.com/ParrotSec/mimikatz). O mimikatz permite a extração de credenciais de autenticação de sistemas Windows, como senhas em texto simples, hashes de senhas, tickets Kerberos, e etc. 

Utilizando o comando:
```
dpapi::masterkey /in:"AppData/Roaming/Microsoft/Protect/S-1-5-21-3854677062-280096443-3674533662-1001/8c6b6187-8eaa-48bd-be16-98212a441580" /sid:S-1-5-21-3854677062-280096443-3674533662-1001 /password: ?????????
```
É possível extrair a master key.

![](https://i.imgur.com/nt7VAP0.png)

## Descriptografando as senhas.

Antes de realizarmos o procedimento para conseguirmos obter as credenciais armazenadas localmente no Google Chrome, será necessário extrair a chave armazenada no arquivo Local State. Dessa forma:  
```
cat AppData/Local/Google/Chrome/User\ Data/Local\ State | jq .os_crypt.encrypted_key -r
```
![](https://i.imgur.com/Fs31vy3.png)

Voltando ao mimikatz: 
```
dpapi::chrome /in:"AppData/Local/Google/Chrome/User Data/Default/Login Data" /masterkey:ca4387e???????????????0ddb868a03ee6a3f9840 /encryptedKey:RFBBUEkBAAAA0Iyd3wEV0RGMegDAT8KX6wEAAACHYWuMqo69SL4WmCEqRBWAAAAAAAIAAAAAABBmAAAAAQAAIAAAAHPuV6P/8jN+rng8E61Z0xxi2hUf4Q4oxa5gFqSnctqdAAAAAA6AAAAAAgAAIAAAAAEF9lst8zMKmCFJ3WmD46TZY/xJF+s5Xf9mTQ2wa16ZMAAAABFU2C2V+l6K3y7ROKkA0cIaWyuXB9i7zUwBBu6mt7vM2QGZtqmjhcX6ZSWrX8JUwkAAAADgBkMLAP19Rtax5T8aKAESgwV+ABz65DOgEGwwSkkQMbWrwz7p42SzpfJUj7jcyUSTOblLRNtB8YTwhm3wCQSi
```

E assim, finalmente conseguimos visualizar as credenciais armazenadas:
![](https://i.imgur.com/vLP3Au0.png)