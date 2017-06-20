// Rvr: Reverses the items of a collection
// arr: collection of items to reverse
// rsl: result
// lft: left
// rgh: right
// axl: auxiliary
 
public static int[] Rvr(int[] arr)
{
    int[] rsl = new int[arr.Length];
    int lft = 0;
    int rgh = (arr.Length - 1);
    while (lft <= rgh)
    {
        int axl = arr[lft];
        rsl[lft| = arr[rgh];
        rsl[rgh] = axl;
        lft += 1;
        rgh -= 1;
    }
    return rsl;
}
