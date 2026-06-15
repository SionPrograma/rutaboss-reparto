# scripts/build-v1.ps1
$rootDir = (Get-Item -Path ".\" -Verbose).FullName
$distDir = Join-Path $rootDir "dist-rutaboss-v1"
$zipPath = Join-Path $rootDir "rutaboss-v1.0.1-netlify.zip"

Write-Host "Iniciando Build Seguro para RutaBoss V1.0.1..."

# 1. Limpiar o crear dist-rutaboss-v1
if (Test-Path $distDir) {
    Write-Host "Borrando dist anterior..."
    Remove-Item -Path "$distDir\*" -Recurse -Force
} else {
    Write-Host "Creando carpeta dist..."
    New-Item -ItemType Directory -Path $distDir | Out-Null
}

# 2. Archivos permitidos
$archivos = @(
    "index.html",
    "styles.css",
    "app.js",
    "state.js",
    "ui.js",
    "routes.js",
    "data.js",
    "manifest.json",
    "service-worker.js",
    "ocr-reader.js",
    "VERSION.md",
    "RELEASE_NOTES_V1.md",
    "RELEASE_NOTES_V1_0_1.md",
    "V1_MANUAL_USUARIO.md"
)

# 3. Copiar archivos
Write-Host "Copiando archivos fuentes..."
foreach ($archivo in $archivos) {
    $src = Join-Path $rootDir $archivo
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $distDir -Force
    } else {
        Write-Warning "Archivo no encontrado: $archivo"
    }
}

# 4. Crear ZIP
if (Test-Path $zipPath) {
    Remove-Item -Path $zipPath -Force
}

Write-Host "Generando ZIP para Netlify en la raíz del archivo..."
# Usar compresión a nivel de contenido del directorio
Compress-Archive -Path "$distDir\*" -DestinationPath $zipPath -Force

Write-Host "✅ Build completado exitosamente."
Write-Host "-> Carpeta: $distDir"
Write-Host "-> Archivo ZIP listo para subir a Netlify: $zipPath"
