"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Search, Star, Copy, Mail } from "lucide-react";

interface BookSearchResult {
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    publisher?: string[];
    isbn?: string[];
    cover_i?: number;
}

export function BookReviewForm() {
    const [bookTitle, setBookTitle] = useState("");
    const [bookAuthor, setBookAuthor] = useState("");
    const [bookYear, setBookYear] = useState("");
    const [bookPublisher, setBookPublisher] = useState("");
    const [genre, setGenre] = useState("");
    const [summary, setSummary] = useState("");
    const [rating, setRating] = useState("");
    const [review, setReview] = useState("");
    const [writer, setWriter] = useState(""); // Default writer name
    const [quotes, setQuotes] = useState("");
    const [additionalSignOff, setAdditionalSignOff] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [goodreadsQuotes, setGoodreadsQuotes] = useState<string[]>([]);
    const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
    const [showQuotes, setShowQuotes] = useState(false);

    const searchBooks = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://openlibrary.org/search.json?q=${encodeURIComponent(
                    searchQuery
                )}&limit=10`
            );
            const data = await response.json();
            setSearchResults(data.docs || []);
            setShowResults(true);
        } catch (error) {
            console.error("Error searching books:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const selectBook = (book: BookSearchResult) => {
        setBookTitle(book.title);
        setBookAuthor(book.author_name?.[0] || "");
        setBookYear(book.first_publish_year?.toString() || "");
        setBookPublisher(book.publisher?.[0] || "");
        setShowResults(false);
        setSearchQuery("");
    };

    const fetchGoodreadsQuotes = async () => {
        setIsLoadingQuotes(true);
        try {
            // Using a CORS proxy to fetch Goodreads page
            const proxyUrl = "https://api.allorigins.win/get?url=";
            const goodreadsUrl =
                "https://www.goodreads.com/work/quotes/90736001-blood-over-bright-haven";

            const response = await fetch(
                proxyUrl + encodeURIComponent(goodreadsUrl)
            );
            const data = await response.json();

            if (data.contents) {
                // Parse the HTML to extract quotes
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, "text/html");

                // Look for quote elements (Goodreads uses various selectors)
                const quoteElements = doc.querySelectorAll(
                    '.quoteText, .readable, [data-testid="quote"]'
                );
                const extractedQuotes: string[] = [];

                quoteElements.forEach((element) => {
                    let quoteText = element.textContent?.trim();
                    if (quoteText) {
                        // First, normalize all whitespace
                        quoteText = quoteText.replace(/\s+/g, " ").trim();

                        // Look for the opening quote and find the matching closing quote
                        let startQuote = -1;
                        let endQuote = -1;

                        // Find opening quote
                        for (let i = 0; i < quoteText.length; i++) {
                            if (
                                quoteText[i] === '"' ||
                                quoteText[i] === '"' ||
                                quoteText[i] === '"'
                            ) {
                                startQuote = i;
                                break;
                            }
                        }

                        // Find closing quote after the opening quote
                        if (startQuote !== -1) {
                            for (
                                let i = startQuote + 1;
                                i < quoteText.length;
                                i++
                            ) {
                                if (
                                    quoteText[i] === '"' ||
                                    quoteText[i] === '"' ||
                                    quoteText[i] === '"'
                                ) {
                                    endQuote = i;
                                    // Don't break here, keep looking for the last closing quote
                                }
                            }
                        }

                        // Extract just the quote content
                        if (
                            startQuote !== -1 &&
                            endQuote !== -1 &&
                            endQuote > startQuote
                        ) {
                            quoteText = quoteText.substring(
                                startQuote + 1,
                                endQuote
                            );
                        } else {
                            // Fallback: remove everything after any dash
                            quoteText = quoteText
                                .replace(/\s*[―—-]\s*.*$/, "")
                                .trim();
                            // Remove surrounding quotes
                            quoteText = quoteText
                                .replace(/^["'"'""]|["'"'""]$/g, "")
                                .trim();
                        }

                        if (
                            quoteText.length > 20 &&
                            extractedQuotes.length < 10
                        ) {
                            extractedQuotes.push(quoteText);
                        }
                    }
                });

                setGoodreadsQuotes(extractedQuotes);
                setShowQuotes(true);
            }
        } catch (error) {
            console.error("Error fetching Goodreads quotes:", error);
            // Fallback with some sample quotes for testing
            setGoodreadsQuotes([
                "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.",
                "In the end, we will remember not the words of our enemies, but the silence of our friends.",
                "The future belongs to those who believe in the beauty of their dreams.",
            ]);
            setShowQuotes(true);
        } finally {
            setIsLoadingQuotes(false);
        }
    };

    const addQuoteToSelection = (quote: string) => {
        const currentQuotes = quotes ? quotes + "\n\n" : "";
        setQuotes(currentQuotes + `"${quote}"`);
    };

    const generateEmailContent = () => {
        const ratingStars =
            "★".repeat(Math.floor(Number(rating))) +
            (rating.includes(".5") ? "☆" : "");

        return `Subject: The Bookworm Newsletter: ${bookTitle}

Merry Winter! 

After a bit of a reading slump, I'm so back 😯

Title: ${bookTitle}
Author: ${bookAuthor}
Rating: ${ratingStars} (${rating}/5)
Genre: ${genre || "[Add genre here]"}

Summary

${summary || "[Add your book summary here]"}

Thoughts, Feelings, Emotions

${review}

Favourite Quotes

${quotes || "[Add your favourite quotes here]"}

- ${writer}${
            additionalSignOff
                ? `

${additionalSignOff}`
                : ""
        }`;
    };
    console.log(bookTitle, rating, review, writer);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(generateEmailContent());
    };

    const openEmailClient = () => {
        const emailContent = generateEmailContent();
        const subject = `The Bookworm Newsletter: ${bookTitle}`;
        const body = emailContent.split("\n").slice(1).join("\n"); // Remove subject line

        const mailtoLink = `mailto:?subject=${encodeURIComponent(
            subject
        )}&body=${encodeURIComponent(body)}`;
        window.open(mailtoLink);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">
                        Bookworm Review Writer
                    </h1>
                    <ThemeToggle />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Book Search Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5" />
                                Find Book
                            </CardTitle>
                            <CardDescription>
                                Search for a book to auto-populate details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Search by title or author..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && searchBooks()
                                    }
                                />
                                <Button
                                    onClick={searchBooks}
                                    disabled={isSearching}
                                    size="icon">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>

                            {showResults && (
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {searchResults.map((book, index) => (
                                        <div
                                            key={index}
                                            className="p-3 border rounded cursor-pointer hover:bg-accent"
                                            onClick={() => selectBook(book)}>
                                            <div className="font-medium">
                                                {book.title}
                                            </div>
                                            {book.author_name && (
                                                <div className="text-sm text-muted-foreground">
                                                    by {book.author_name[0]}
                                                </div>
                                            )}
                                            {book.first_publish_year && (
                                                <div className="text-xs text-muted-foreground">
                                                    {book.first_publish_year}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Book Details Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Book Details</CardTitle>
                            <CardDescription>
                                Enter the book information manually or use
                                search
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Book Title</Label>
                                <Input
                                    id="title"
                                    value={bookTitle}
                                    onChange={(e) =>
                                        setBookTitle(e.target.value)
                                    }
                                    placeholder="Enter book title"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="author">Author</Label>
                                <Input
                                    id="author"
                                    value={bookAuthor}
                                    onChange={(e) =>
                                        setBookAuthor(e.target.value)
                                    }
                                    placeholder="Enter author name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input
                                        id="year"
                                        value={bookYear}
                                        onChange={(e) =>
                                            setBookYear(e.target.value)
                                        }
                                        placeholder="2024"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="publisher">Publisher</Label>
                                    <Input
                                        id="publisher"
                                        value={bookPublisher}
                                        onChange={(e) =>
                                            setBookPublisher(e.target.value)
                                        }
                                        placeholder="Publisher name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rating">Rating</Label>
                                <Select
                                    value={rating}
                                    onValueChange={setRating}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select rating" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">
                                            ★☆☆☆☆ (1/5)
                                        </SelectItem>
                                        <SelectItem value="1.5">
                                            ★☆☆☆☆ (1.5/5)
                                        </SelectItem>
                                        <SelectItem value="2">
                                            ★★☆☆☆ (2/5)
                                        </SelectItem>
                                        <SelectItem value="2.5">
                                            ★★☆☆☆ (2.5/5)
                                        </SelectItem>
                                        <SelectItem value="3">
                                            ★★★☆☆ (3/5)
                                        </SelectItem>
                                        <SelectItem value="3.5">
                                            ★★★☆☆ (3.5/5)
                                        </SelectItem>
                                        <SelectItem value="4">
                                            ★★★★☆ (4/5)
                                        </SelectItem>
                                        <SelectItem value="4.5">
                                            ★★★★☆ (4.5/5)
                                        </SelectItem>
                                        <SelectItem value="5">
                                            ★★★★★ (5/5)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="genre">Genre</Label>
                                <Input
                                    id="genre"
                                    value={genre}
                                    onChange={(e) => setGenre(e.target.value)}
                                    placeholder="e.g., Magical realism, Romance, etc."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Summary Section */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Book Summary</CardTitle>
                            <CardDescription>
                                Write a brief summary of the book's plot and
                                themes
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Provide a concise summary of the book's main plot, characters, and themes..."
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                className="min-h-32"
                            />
                        </CardContent>
                    </Card>

                    {/* Review Section */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5" />
                                Thoughts, Feelings, Emotions
                            </CardTitle>
                            <CardDescription>
                                Share your detailed thoughts and personal
                                reflections on the book
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Share your detailed thoughts, analysis, and emotional response to the book..."
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                className="min-h-40"
                            />
                        </CardContent>
                    </Card>

                    {/* Quotes Section */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Favourite Quotes</CardTitle>
                            <CardDescription>
                                Add memorable quotes from the book or fetch
                                popular quotes from Goodreads
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    onClick={fetchGoodreadsQuotes}
                                    disabled={isLoadingQuotes}
                                    variant="outline"
                                    size="sm">
                                    {isLoadingQuotes
                                        ? "Loading..."
                                        : "Fetch Quotes from Goodreads"}
                                </Button>
                            </div>

                            {showQuotes && goodreadsQuotes.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium">
                                        Popular Quotes (click to add):
                                    </h4>
                                    <div className="max-h-40 overflow-y-auto space-y-2">
                                        {goodreadsQuotes.map((quote, index) => (
                                            <div
                                                key={index}
                                                className="p-2 border rounded cursor-pointer hover:bg-accent text-sm"
                                                onClick={() =>
                                                    addQuoteToSelection(quote)
                                                }>
                                                "{quote}"
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Textarea
                                placeholder="Add your favourite quotes from the book, each on a new line..."
                                value={quotes}
                                onChange={(e) => setQuotes(e.target.value)}
                                className="min-h-32"
                            />
                        </CardContent>
                    </Card>

                    {/* Additional Sign-off Section */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Additional Sign-off</CardTitle>
                            <CardDescription>
                                Optional additional text for your sign-off
                                (e.g., currently reading, personal note)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="e.g., Currently reading: Never Let Me Go by Kazuo Ishiguro"
                                value={additionalSignOff}
                                onChange={(e) =>
                                    setAdditionalSignOff(e.target.value)
                                }
                                className="min-h-20"
                            />
                        </CardContent>
                    </Card>

                    {/* Writer Section */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Writer Info</CardTitle>
                            <CardDescription>
                                Your name for the email signature
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="writer">Your Name</Label>
                                <Input
                                    id="writer"
                                    value={writer}
                                    onChange={(e) => setWriter(e.target.value)}
                                    placeholder="Enter your name"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <Card className="md:col-span-2">
                        <CardContent className="pt-6">
                            <div className="flex gap-2">
                                <Button
                                    onClick={copyToClipboard}
                                    disabled={
                                        !bookTitle ||
                                        !rating ||
                                        !review ||
                                        !writer
                                    }
                                    variant="outline"
                                    className="flex items-center gap-2">
                                    <Copy className="h-4 w-4" />
                                    Copy to Clipboard
                                </Button>
                                <Button
                                    onClick={openEmailClient}
                                    disabled={
                                        !bookTitle ||
                                        !rating ||
                                        !review ||
                                        !writer
                                    }
                                    className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Open Email
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview Section */}
                    {bookTitle && rating && review && writer && (
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Email Preview</CardTitle>
                                <CardDescription>
                                    Preview of your book review email
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded max-h-96 overflow-y-auto">
                                    {generateEmailContent()}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BookReviewForm;
