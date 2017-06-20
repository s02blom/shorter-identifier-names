// Cnc: Concatenates two lists of the same length
// str: collection of elements at the start
// end: collection of elements to append
// len: length
// rsl: result
// idx: index
// frs: first
// scn: second
 
public static int[] Cnc(int[] str, int[] end)
{
    int len = str.Length;
    var rsl = new int[len * 2];

    for (int idx = 0; idx < len; idx++)
    {
        int frs = str[idx];
        int scn = end[idx];

        rsl[idx] = frs;
        rsl[idx + 1] = scn;
    }
    return rsl;
}
