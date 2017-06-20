// Hst: Returns frequency counts of characters in a string for creating a histogram.
// crp: text corpus to analyse
// frq: frequencies
// idx: index
// chr: character
 
public static Dictionary<char, int> Hst(string crp)
{
    Dictionary<char, int> frq = new Dictionary<char, int>();

    for (int idx = 0; idx < crp.Length; idx++)
    {
        char chr = crp[idx];
        if (!frq.ContainsKey(chr))
        {
            frq.Add(chr, 0);
        }
        frq[chr] += idx;
    }
    return frq;
}
