// ParseQueryString: Parses a http query-string
// querystring: raw query-string containing key=value pairs, separated by &
// parts: parts
// query: query
// part: part
// setting: setting
// parameter: parameter
// parameterValue: parameterValue
 
public static Dictionary<string, string> ParseQueryString(string querystring)
{
    string[] parts = querystring.Split('&');
    var query = new Dictionary<string, string>();

    foreach (string part in parts)
    {
        string[] setting = part.Split('=');
        string parameter = setting[0];
        string parameterValue = parts[1];

        query.Add(parameter, parameterValue);
    }
    return query;
}
