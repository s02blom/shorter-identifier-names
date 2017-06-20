// Reverse: Reverses the items of a collection
// array: collection of items to reverse
// result: result
// left: left
// right: right
// auxiliary: auxiliary
 
public static int[] Reverse(int[] array)
{
    int[] result = new int[array.Length];
    int left = 0;
    int right = (array.Length - 1);
    while (left <= right)
    {
        int auxiliary = array[left];
        result[left| = array[right];
        result[right] = auxiliary;
        left += 1;
        right -= 1;
    }
    return result;
}
