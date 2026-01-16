# Logo do Projeto IA Acadêmica

Esta pasta está preparada para armazenar os arquivos de logo do projeto.

## Arquivos Recomendados

### 1. Logo Principal
- **logo.svg** - Versão vetorial (recomendado para qualidade em qualquer tamanho)
- **logo.png** - Versão PNG de alta resolução (1024x1024px ou maior)

### 2. Variações
- **logo-light.svg/png** - Logo otimizada para tema claro
- **logo-dark.svg/png** - Logo otimizada para tema escuro
- **logo-icon.svg/png** - Apenas o ícone/marca sem texto (para favicon e app icons)

### 3. Favicons
- **favicon.ico** - Ícone para navegadores (16x16, 32x32, 48x48px)
- **favicon-16x16.png**
- **favicon-32x32.png**
- **apple-touch-icon.png** - 180x180px para dispositivos Apple

## Uso nos Arquivos HTML

Após adicionar a logo, atualize os seguintes arquivos:

### Header (todas as páginas)
```html
<a href="index.html" class="flex items-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
    <img src="assets/logo/logo.svg" alt="IA Acadêmica" class="h-8 mr-2">
    IA Acadêmica
</a>
```

### Favicon (no `<head>` de cada página)
```html
<link rel="icon" type="image/png" sizes="32x32" href="assets/logo/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="assets/logo/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/logo/apple-touch-icon.png">
```

## Diretrizes de Design

- **Cores**: Usar a paleta do projeto (Primary: #6366f1)
- **Estilo**: Moderno, minimalista, relacionado a educação/IA
- **Formato**: Preferir SVG para escalabilidade
- **Contraste**: Garantir legibilidade em temas claro e escuro

## Ferramentas Sugeridas

- **Criação**: Figma, Adobe Illustrator, Canva
- **Conversão**: SVG to PNG (cloudconvert.com)
- **Favicon**: RealFaviconGenerator (realfavicongenerator.net)
