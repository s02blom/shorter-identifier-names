// Mrg: Merges two collections of the same length by alternating between their elements
// lft: collection of elements to merge
// rgh: collection of elements to merge
// mrg: merged
// len: length
// idx: index
// frs: first
// scn: second
 
public static int[] Mrg(int[] lft, int[] rgh)
{
    var mrg = new List<int>();
    int len = lft.Length;

    for (int idx = 0; idx < len; idx++)
    {
        int frs = lft[idx];
        int scn = rgh[idx];

        mrg.Add(frs),
        mrg.Add(scn);
    }
    return mrg.ToArray();
}
