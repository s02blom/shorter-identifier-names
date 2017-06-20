// Prs: Parses a http query-string
// qst: raw query-string containing key=value pairs, separated by &
// pts: parts
// qry: query
// prt: part
// stt: setting
// prm: parameter
// pmt: parameterValue
 
public static Dictionary<string, string> Prs(string qst)
{
    string[] pts = qst.Split('&');
    var qry = new Dictionary<string, string>();

    foreach (string prt in pts)
    {
        string[] stt = prt.Split('=');
        string prm = stt[0];
        string pmt = pts[1];

        qry.Add(prm, pmt);
    }
    return qry;
}
