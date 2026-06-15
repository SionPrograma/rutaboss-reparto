# scripts/clean-dev.ps1
$rootDir = (Get-Item -Path ".\" -Verbose).FullName

Write-Host "Iniciando limpieza de entorno de desarrollo..."

# Limpiar ZIPs viejos
$zips = Get-ChildItem -Path $rootDir -Filter "*.zip" | Where-Object { $_.Name -ne "rutaboss-v1.0.0-netlify.zip" }
foreach ($zip in $zips) {
    Remove-Item $zip.FullName -Force
    Write-Host "Eliminado ZIP obsoleto: $($zip.Name)"
}

# Limpiar test-unzip-rutaboss si existe
$testUnzip = Join-Path $rootDir "test-unzip-rutaboss"
if (Test-Path $testUnzip) {
    Remove-Item -Path $testUnzip -Recurse -Force
    Write-Host "Eliminado directorio temporal: test-unzip-rutaboss"
}

Write-Host "✅ Limpieza completada. No se modificó el código fuente."
