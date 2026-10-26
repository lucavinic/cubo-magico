# Cubo Mágico Passo a Passo

Site local que ensina a montar o cubo 3x3, o 2x2, a Pyraminx e o Megaminx (12 faces) com um modelo 3D que você gira com o mouse.

## Como rodar

```bash
npm install
npm run dev
```

Abra http://localhost:5200

## O que tem

- **Aprender**: lições pelo método de camadas. Cada caso mostra como deve ficar, a seta do próximo giro e o algoritmo movimento a movimento (tocar, pausar, voltar). As peças que ainda não importam ficam cinza, e a peça da vez pisca. "Tentar sozinho" deixa você fazer os movimentos.
- **Praticar**: embaralhar, girar pelos botões ou teclado e desfazer.

## Conferência dos algoritmos

```bash
npm run verificar
```

Simula todas as lições e confere que cada algoritmo chega no objetivo sem desmontar o que já estava pronto. Em `tools/` também ficam os scripts de busca usados para achar os algoritmos do Megaminx e da Pyraminx.
