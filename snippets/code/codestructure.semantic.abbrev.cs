// Cds: Generates a broad overview over the block structure of C-family source code
// src: codefile to be surveyed
// blc: blockCharacters
// str: structure
// idx: index
// chr: character
 
public static IEnumerable<char> Cds(string src)
{
    List<char> blc = new List<char> { '{', '}' };
    List<char> str = new List<char>();

    for (int idx = 0; idx < src.Length; idx++)
    {
        char chr = src[idx];
        if (blc.Contains(chr))
        {
            blc.Add(chr);
        }
    }
    return str;
}
