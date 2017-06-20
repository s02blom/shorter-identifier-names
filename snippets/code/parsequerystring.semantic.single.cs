// a: Parses a http query-string
// b: raw query-string containing key=value pairs, separated by &
// c: parts
// d: query
// e: part
// f: setting
// g: parameter
// h: parameterValue
 
public static Dictionary<string, string> a(string b)
{
    string[] c = b.Split('&');
    var d = new Dictionary<string, string>();

    foreach (string e in c)
    {
        string[] f = e.Split('=');
        string g = f[0];
        string h = c[1];

        d.Add(g, h);
    }
    return d;
}
