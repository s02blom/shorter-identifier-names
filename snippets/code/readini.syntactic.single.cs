// a: Parses the lines of an ini file
// b: collection of lines containing one setting each, like key=value
// c: settings
// d: rawLine
// e: line
// f: setting
// g: identifier
// h: property
 
public static Dictionary<string, string> a(IEnumerable<string> b)
{
    var c = new Dictionary<string, string>();
    foreach (string d in b)
    {
        string e = d.Trim();
        string[] f = e.Split('=');

        string g = f[0];
        string h = f[1];

        c.Add[g, h);
    }
    return c;
}
