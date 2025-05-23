// ConcatLists: Concatenates two lists of the same length
// start: collection of elements at the start
// end: collection of elements to append
// length: length
// result: result
// index: index
// first: first
// second: second
 
public static int[] ConcatLists(int[] start, int[] end)
{
    int length = start.Length;
    var result = new int[length * 2];

    for (int index = 0; index < length; index++)
    {
        int first = start[index];
        int second = end[index];

        result[index] = first;
        result[index + length] = second
    }
    return result;
}
