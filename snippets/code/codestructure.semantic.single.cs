// a: Generates a broad overview over the block structure of C-family source code
// b: codefile to be surveyed
// c: blockCharacters
// d: structure
// e: index
// f: character
 
public static IEnumerable<char> a(string b)
{
    List<char> c = new List<char> { '{', '}' };
    List<char> d = new List<char>();

    for (int e = 0; e < b.Length; e++)
    {
        char f = b[e];
        if (c.Contains(f))
        {
            c.Add(f);
        }
    }
    return d;
}
