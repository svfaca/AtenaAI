# Logo do Projeto AtenaAI

Esta pasta contém todos os arquivos de logo e ícones do projeto.

## Arquivos Disponíveis

### Logo Principal
- ✅ **logo.png** - Logo completa em PNG de alta resolução
- ✅ **logo-light.png** - Logo otimizada para tema claro  
- ✅ **logo-light.svg** - Logo vetorial para tema claro
- ✅ **logo-dark.png** - Logo otimizada para tema escuro
- ✅ **logo-dark.svg** - Logo vetorial para tema escuro

### Ícones
- ✅ **logo-icon.png** - Ícone/marca principal em PNG (usado nos headers)
- ✅ **logo-icon.svg** - Ícone em formato vetorial
- ✅ **logo-icon-light.png** - Ícone para tema claro
- ✅ **logo-icon-dark.png** - Ícone para tema escuro

### Favicons
- ✅ **favicon.ico** - Ícone para navegadores (múltiplas resoluções)
- ✅ **favicon.png** - Favicon em PNG
- ✅ **favicon-16x16.png** - Favicon 16x16px
- ✅ **favicon-32x32.png** - Favicon 32x32px
- ✅ **apple-touch-icon.png** - Ícone 180x180px para dispositivos Apple

## Uso nos Arquivos HTML

### Header (todas as páginas)
```html
<a href="index.html" class="flex items-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
    <img src="assets/logo/logo.svg" alt="AtenaAI" class="h-8 mr-2">
    AtenaAI
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
