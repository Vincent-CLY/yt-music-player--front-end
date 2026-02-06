export default function parsePlaylistId(url: string): string  {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)?(\/playlist\?list=)?([\w-]+).*$/;
    const match = url.match(pattern);
    if (match && match[5]) {
        return match[5];
    } else {
        return "";
    }
}