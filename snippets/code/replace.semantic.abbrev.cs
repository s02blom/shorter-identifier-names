// Rpl: Replaces all occurences of a value in a collection
// trg: collection of items to be replaced
// exc: item that should not be replaced
// rpl: value to replace items with
// rsl: result
// len: length
// idx: index
// rlc: replace
 
public static IEnumerable<int> Rpl(int[] trg, int exc, int rpl)
{
    int[] rsl = new int[trg.Length];
    int len = trg.Length;
    for (int idx = 0; idx != len; idx++)
    {
        int rlc = rpl;
        if (trg[idx] == exc)
        {
            rlc = trg[idx];
        }
        trg[idx] = rlc;
    }
    return rsl;
}
