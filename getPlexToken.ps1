# source: https://forums.plex.tv/t/how-to-request-a-x-plex-token-token-for-your-app/84551/2
$url = "https://plex.tv/users/sign_in.xml"
$BB = [System.Text.Encoding]::UTF8.GetBytes("plexusername:plexpassword")
$EncodedPassword = [System.Convert]::ToBase64String($BB)

$headers = @{}
$headers.Add("Authorization","Basic $($EncodedPassword)") | out-null
$headers.Add("X-Plex-Client-Identifier","TESTSCRIPTV1") | Out-Null
$headers.Add("X-Plex-Product","Test script") | Out-Null
$headers.Add("X-Plex-Version","V1") | Out-Null

[xml]$res = Invoke-RestMethod -Headers:$headers -Method Post -Uri:$url

$token = $res.user.authenticationtoken

Write-Host "Your Plex token: " -NoNewline
Write-Host $token
Pause