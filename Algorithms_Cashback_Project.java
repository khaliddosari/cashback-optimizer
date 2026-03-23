import java.util.ArrayList;
import java.util.Random;
import java.util.Scanner;

//Khalid Abdullah Al Dosari - 443018297
//Zeyad Moawad Nazir - 444000368
//Abdulellah Abdulrahman Altowaijri - 444003866

public class Algorithms_Cashback_Project {
    // Variable declarations
    private static int numberOfCards, numberOfCategories, base, numberOfAssignments;
    private static ArrayList<ArrayList<Integer>> allAssignments;
    private static double[] amountSpent, limit, cardsTotalSpending_forOneAssignment;
    private static double[][] rates;

   
    // This method creates all possible assignments of categories to cards
    private static void createAllAssignments() {
        allAssignments = new ArrayList<>();
        for (int i = 0; i < numberOfAssignments; i++) {
            int temp = i;
            ArrayList<Integer> currentAssignment = new ArrayList<>();
            // Convert the number to base-numberOfCards and add 1 to each digit
            for (int j = 0; j <= numberOfCategories - 1; j++) {
                currentAssignment.add(0, (temp % base) + 1);
                temp /= base;
            }
            allAssignments.add(currentAssignment);
        }
    }

    // This method calculates how much each card has spent for a given assignment
    private static void allCardsTotalSpending_forOneAssignment(ArrayList<Integer> currentAssignment) {
        // Reset all card spending to zero
        for (int i = 0; i < numberOfCards; i++) {
            cardsTotalSpending_forOneAssignment[i] = 0;
        }
        // Add up spending for each category to its assigned card
        for (int i = 0; i < numberOfCategories; i++) {
            int cardIndex = currentAssignment.get(i) - 1;
            cardsTotalSpending_forOneAssignment[cardIndex] += amountSpent[i];
        }
    }

    // This method checks if a given assignment stays within card limits
    private static boolean checkAssignment(ArrayList<Integer> currentAssignment) {
        allCardsTotalSpending_forOneAssignment(currentAssignment);
        for (int i = 0; i < numberOfCards; i++) {
            if (cardsTotalSpending_forOneAssignment[i] > limit[i]) {
                return false;
            }
        }
        return true;
    }

    // This method calculates total cashback for a given assignment
    private static double cashbackCalculation_forOneAssignment(ArrayList<Integer> currentAssignment) {
        double totalCashback = 0.0;
        // For each category, calculate cashback based on its card's rate
        for (int i = 0; i < numberOfCategories; i++) {
            int cardIndex = currentAssignment.get(i) - 1;
            totalCashback += amountSpent[i] * (rates[cardIndex][i] / 100.0);
        }
        return totalCashback;
    }

    // This method tries all possible assignments to find the best one
    private static final int MAX_BRUTE_FORCE_ASSIGNMENTS = 10_000_000;

    private static void bruteForce() {
        double totalAssignments = Math.pow(base, numberOfCategories);
        if (totalAssignments > MAX_BRUTE_FORCE_ASSIGNMENTS) {
            System.out.println("/------------------ BruteForce ------------------\\\n");
            System.out.printf("Skipped: too many assignments to try (%.0f). Max allowed: %,d\n", totalAssignments, MAX_BRUTE_FORCE_ASSIGNMENTS);
            System.out.println("\n\\------------------------------------------------/\n");
            return;
        }
        numberOfAssignments = (int) totalAssignments;
        createAllAssignments();
        double maximumCashback = -1;
        ArrayList<Integer> bestAssignment = null;

        for (ArrayList<Integer> permutation : allAssignments) {
            if (checkAssignment(permutation)) {
                double cashback = cashbackCalculation_forOneAssignment(permutation);
                // Keep track of the best permutation found
                if (cashback > maximumCashback) {
                    maximumCashback = cashback;
                    bestAssignment = permutation;
                }
            }
        }
        bruteForceResult(bestAssignment, maximumCashback);
    }

    private static void bruteForceResult(ArrayList<Integer> bestAssignment, double maximumCashback) {
        if (bestAssignment == null) {
            System.err.println("\n            No valid assignment found\n\n");
            return;
        }

        System.out.println("/------------------ BruteForce ------------------\\\n");
        System.out.printf("%-10s %-10s %-7s %-10s %-10s\n", "Category", "Amount", "Rate", "Card", "Cashback\n");
        double totalCashback = 0.0;
        
        for (int i = 0; i < numberOfCategories; i++) {
            int cardIndex = bestAssignment.get(i) - 1;
            double amount = amountSpent[i];
            double rate = rates[cardIndex][i];
            double cashback = amount * (rate / 100.0);
            totalCashback += cashback;
            System.out.printf("%-10s $%-9.2f %-7.2f %-10s $%-10.2f\n",
                    "Cat " + (i + 1), amount, rate, "Card " + (cardIndex + 1), cashback);
        }
        System.out.printf("\nTotal Cashback = $%.2f\n", totalCashback);
        System.out.println("\n\\------------------------------------------------/\n");
    }

    // This method finds a solution by always choosing the best rate available
    // Categories are sorted by spending amount (descending) to prioritize larger spends first
    private static void greedy() {
        double[] currentSpent = new double[numberOfCards];
        int[] chosenCards = new int[numberOfCategories];
        double totalCashback = 0.0;

        // Sort category indices by spending amount (descending) to prioritize larger spends
        Integer[] sortedIndices = new Integer[numberOfCategories];
        for (int i = 0; i < numberOfCategories; i++) {
            sortedIndices[i] = i;
        }
        for (int i = 0; i < numberOfCategories - 1; i++) {
            for (int j = i + 1; j < numberOfCategories; j++) {
                if (amountSpent[sortedIndices[j]] > amountSpent[sortedIndices[i]]) {
                    Integer temp = sortedIndices[i];
                    sortedIndices[i] = sortedIndices[j];
                    sortedIndices[j] = temp;
                }
            }
        }

        // For each category (largest spend first), pick the card with the best rate
        for (int idx = 0; idx < numberOfCategories; idx++) {
            int i = sortedIndices[idx];
            int bestCard = -1;
            double bestRate = -1;

            // Look at each card to find the best rate
            for (int j = 0; j < numberOfCards; j++) {
                if (currentSpent[j] + amountSpent[i] <= limit[j] && rates[j][i] > bestRate) {
                    bestRate = rates[j][i];
                    bestCard = j;
                }
            }

            // If no card can take this category, we failed
            if (bestCard == -1) {
                System.err.println("\nFailed to allocate category " + (i + 1) + " due to exceeding all limits\n\n");
                return;
            }

            // Assign the category to the best card found
            chosenCards[i] = bestCard;
            currentSpent[bestCard] += amountSpent[i];
            totalCashback += amountSpent[i] * (rates[bestCard][i] / 100.0);
        }

        greedyResult(chosenCards, totalCashback);
    }

    private static void greedyResult(int[] chosenCards, double totalCashback) {
        System.out.println("/-------------------- Greedy --------------------\\\n");
        System.out.printf("%-10s %-10s %-10s %-10s %-10s\n", "Category", "Amount", "Rate", "Card", "Cashback\n");
        
        for (int i = 0; i < numberOfCategories; i++) {
            int card = chosenCards[i];
            double cashback = amountSpent[i] * (rates[card][i] / 100.0);
            System.out.printf("%-10s $%-9.2f %-9.2f %-10s $%-10.2f\n",
                    "Cat " + (i + 1), amountSpent[i], rates[card][i], "Card " + (card + 1), cashback);
        }
        System.out.printf("\nTotal Cashback: $%.2f\n", totalCashback);
        System.out.println("\n\\------------------------------------------------/\n");
    }

    private static void printInputData() {
        System.out.println("/------------------------------------- Input Data -------------------------------------\\\n");
        System.out.println("Amounts Spent per Category:\n");
        for (int i = 0; i < numberOfCategories; i++) {
            System.out.printf("Cat %d: $%.2f\n", i + 1, amountSpent[i]);
        }

        System.out.println("\n\nRates Matrix:\n");

        String temp = "        ";
        for (int i = 1; i < numberOfCategories + 1; i++){
            temp = temp.concat("  cat " + i + "   ");
        };
        System.out.println(temp);

        for (int i = 0; i < numberOfCards; i++) {
            System.out.printf("Card %d: ", i + 1);
            for (int j = 0; j < numberOfCategories; j++) {
                System.out.printf("  %.2f %%  ", rates[i][j]);
            }
            System.out.println();
        }

        System.out.println("\n\nLimit for Each Card:\n");
        for (int i = 0; i < numberOfCards; i++) {
            System.out.printf("Card %d: $%.2f\n", i + 1, limit[i]);
        }
        System.out.println("\n\\--------------------------------------------------------------------------------------/\n");
    }

    private static void userInput() {
        Scanner sc = new Scanner(System.in);
        Random random = new Random();
        
        System.out.println("/////////////////////////////////// Test user input Examples //////////////////////////////////\n");

        // Get number of cards and categories from user
        System.out.println("Enter the number of cards: ");
        numberOfCards = sc.nextInt();
        System.out.println("Enter the number of categories: ");
        numberOfCategories = sc.nextInt();
        
        // Initialize arrays
        amountSpent = new double[numberOfCategories];
        rates = new double[numberOfCards][numberOfCategories];
        limit = new double[numberOfCards];
        cardsTotalSpending_forOneAssignment = new double[numberOfCards];
        
        // Get the amount spent for each category from user
        System.out.println("\nEnter amount spent for each category:");
        for (int i = 0; i < numberOfCategories; i++) {
            System.out.printf("Category %d: ", i + 1);
            amountSpent[i] = sc.nextDouble();
        }
        
        // Get limit for each card from user
        System.out.println("\nEnter spending limit for each card:");
        for (int i = 0; i < numberOfCards; i++) {
            System.out.printf("Card %d: ", i + 1);
            limit[i] = sc.nextDouble();
        }
        
        // Generate random rates
        for (int i = 0; i < numberOfCards; i++) {
            for (int j = 0; j < numberOfCategories; j++) {
                rates[i][j] = 1.0 + (5.0 * random.nextDouble());
            }
        }
        
        base = numberOfCards;
        allAssignments = new ArrayList<>();

        sc.close();
    }

    private static void givenExample() {
        numberOfCards = 4;
        numberOfCategories = 6;
        amountSpent = new double[]{600, 400, 100, 300, 500, 800};
        rates = new double[][]{
            {6.0, 2.0, 3.0, 1.5, 3.0, 1.5},
            {5.0, 3.0, 2.0, 5.0, 2.0, 1.5},
            {2.0, 5.0, 4.0, 2.0, 5.0, 1.0},
            {1.5, 2.0, 2.0, 4.0, 2.0, 2.0}
        };
        limit = new double[]{1500.0, 700.0, 2500.0, 3500.0};
        cardsTotalSpending_forOneAssignment = new double[numberOfCards];
        base = numberOfCards;
    }

        private static void testGivenExamples() {
        System.out.println("\n\n/////////////////////////////////// Test Given Examples //////////////////////////////////\n");
        givenExample();
        printInputData();
        bruteForce();
        greedy();
        System.out.println("\n");
    }

    private static void runRandomExample() {
        userInput();
        printInputData();
        bruteForce();
        greedy();
    }

    public static void main(String[] args) {
        testGivenExamples();
        runRandomExample();
    }
}