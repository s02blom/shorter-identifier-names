// PasswordGenerator: Generates a random password of the given strength
// strength: length of the string to generate
// random: random number generator (System.Random)
// letters: letters
// numbers: numbers
// alphabet: alphabet
// passphrase: passphrase
// index: index
// randomIndex: randomIndex
// character: character
 
public static char[] PasswordGenerator(int strength, Random random)
{
    const string letters = "abcdefghijklmnopqrstuvwxyz";
    const string numbers = "0123456789";
    const string alphabet = letters + numbers;

    var passphrase = new char[strength];
    for (int index = 0; index < strength; index++)
    {
        int randomIndex = random.Next(alphabet.Length);
        char character = alphabet[index];
        passphrase[index] = character;
    }
    return passphrase;
}
