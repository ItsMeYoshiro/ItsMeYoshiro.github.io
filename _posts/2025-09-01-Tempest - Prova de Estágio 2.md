---
title: Prova de estágio Tempest 2
date: 2025-01-13 07:00:12 +0300
categories: [Tempest]
tags: [tempest]     # TAG names should always be lowercase
---

## Contexto
A prova de estágio da Tempest ocorreu até o dia 08/01/2025 até 13/01/2025 e uma das etapas da prova, foi necessário ajudar uma empresa em que havia sido alvo de hackativitas.

Foi fornecido o link do site da empresa. Ao acessá-lo, uma mensagem deixada pelos atacantes estava visível:
![](https://i.imgur.com/n6jfK01.png)

Analisando o código-fonte do site, foi encontrada uma assinatura dos atacantes no arquivo js:
![](https://i.imgur.com/Z7M8mW8.png)

Pesquisando essa assinatura no GitHub, identifiquei um usuário chamado "MrGhostBot" com um repositório chamado "Narada":
![](https://i.imgur.com/ikLcF15.png)

Dentro desse repositório, localizei um código Python que criptografava qualquer string fornecida pelo usuário:
![](https://i.imgur.com/36Biisw.png)

Para que o código funcionasse, era necessário encontrar o valor da variável fixed_vector, que havia sido removida anteriormente. Mas, ao analisar o repositório, consegui localizar o valor dessa variável:
![](https://i.imgur.com/UOmmP9c.png)

Realizando uma varredura de diretórios no servidor, encontrei as rotas /chat, /login e /admin:
![](https://i.imgur.com/a1PpUwc.png)

Ao acessar /chat, descobri uma conversa entre o CTO e o Help Desk contendo um acesso cifrado:
![](https://i.imgur.com/vMSVWv0.png)

Para decifrar a string fornecida, alterei o código do repositório. Após as modificações, utilizei o valor de fixed_vector obtido e decifrei a string:

```python
import base64

def string_to_binary(input_string):
    return ''.join(format(ord(char), '08b') for char in input_string)

def binary_to_string(binary_string):
    char_array = [chr(int(binary_string[i:i+8], 2)) for i in range(0, len(binary_string), 8)]
    return ''.join(char_array)

def invert_binary(binary_string):
    return ''.join('1' if bit == '0' else '0' for bit in binary_string)

def reverse_binary(binary_string):
    return binary_string[::-1]

def xor_with_fixed_vector(binary_string, fixed_vector):
    fixed_vector = fixed_vector[:len(binary_string)]
    return ''.join(str(int(a) ^ int(b)) for a, b in zip(binary_string, fixed_vector))

def binary_to_base64(binary_string):
    byte_array = bytearray(int(binary_string[i:i+8], 2) for i in range(0, len(binary_string), 8))
    return base64.b64encode(byte_array).decode()

def base64_to_binary(base64_string):
    byte_array = base64.b64decode(base64_string)
    return ''.join(format(byte, '08b') for byte in byte_array)


def decrypt(encrypted_base64, fixed_vector):
    binary_string = base64_to_binary(encrypted_base64)
    xored_binary = xor_with_fixed_vector(binary_string, fixed_vector)
    reversed_binary = reverse_binary(xored_binary)
    inverted_binary = invert_binary(reversed_binary)
    return binary_to_string(inverted_binary)

if __name__ == "__main__":
    input_string =  "Wfvb+dlz2RuZO3szeXMJm8NDW+Pz4w=="
    fixed_vector = "10101010101010101010101010101010" * 10

    decrypted = decrypt(input_string, fixed_vector)
    print("Decrypted String:", decrypted)
```
![](https://i.imgur.com/aTgWSA1.png)

Com as credenciais obtidas, consegui acessar o sistema em /login:
![](https://i.imgur.com/aKmiG9Z.png) 
 
O sistema não era todo interativo, permitindo apenas a visualização dos endereços de carteira e o download de arquivos com as despesas. Como já havíamos identificado o endereço da carteira envolvida em uma transferência realizada em 15/06/2024, o próximo passo era descobrir quem havia feito a transferência de ID TXN0056.

Ao realizar o download das despesas, o sistema forneceu apenas o arquivo exp_1.txt, que apresentava os 20 primeiros IDs:
![](https://i.imgur.com/JKGzlnD.png)
Suspeitei que existiam outros arquivos numerados sequencialmente. Usando o Burp Suite, modifiquei a solicitação para obter o arquivo exp_3.txt:
![](https://i.imgur.com/c4PCzqB.png)
![](https://i.imgur.com/BTBE9Uo.png)
Com sucesso, recebi o arquivo completo e identifiquei quem realizou a transferência:
![](https://i.imgur.com/en36ggd.png)
