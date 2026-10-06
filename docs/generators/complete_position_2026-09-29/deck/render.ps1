param([string]$In, [string]$Out)
$pp = New-Object -ComObject PowerPoint.Application
try {
    $pres = $pp.Presentations.Open($In, $true, $false, $false)
    $pres.SaveAs($Out, 32)
    $pres.Close()
} finally {
    $pp.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pp) | Out-Null
}
Write-Output "saved $Out"
