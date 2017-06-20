// a: Returns frequency counts of characters in a string for creating a histogram.
// b: text corpus to analyse
// c: frequencies
// d: index
// e: character
 
public static Dictionary<char, int> a(string b)
{
    Dictionary<char, int> c = new Dictionary<char, int>();

    for (int d = 0; d < b.Length; d++)
    {
        char e = b[d];
        if (!c.ContainsKey(e))
        {
            c.Add(e, 0);
        }
        c[e] += d;
    }
    return c;
}
