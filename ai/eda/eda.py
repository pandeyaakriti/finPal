# FinPal Dataset EDA Notebook
# Author: Your Name
# Purpose: Explore remarks and categories in FinPal dataset

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
from wordcloud import WordCloud
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import PCA

# --------------------------
# Step 1: Load Dataset
# --------------------------
df = pd.read_csv(r"C:\Users\HP\Documents\finPal\ai\data\train.csv")
print("Dataset Info:")
print(df.info())
print("\nFirst 5 rows:")
print(df.head())

# Remove missing or duplicate data
df.dropna(inplace=True)
df.drop_duplicates(inplace=True)

# --------------------------
# Step 2: Category Distribution
# --------------------------
plt.figure(figsize=(12,6))
category_counts = df['label'].value_counts()
sns.barplot(x=category_counts.index, y=category_counts.values, palette="viridis")
plt.xticks(rotation=45)
plt.ylabel("Number of Examples")
plt.title("Category Distribution in FinPal Dataset")
plt.tight_layout()
plt.show()

# Pie Chart for Category Distribution
plt.figure(figsize=(8,8))
plt.pie(category_counts.values, labels=category_counts.index, autopct="%1.1f%%", startangle=140, colors=sns.color_palette("tab20"))
plt.title("Category Proportion")
plt.show()

# --------------------------
# Step 3: Text Length Analysis
# --------------------------
df['text_length'] = df['text'].apply(lambda x: len(str(x).split()))
plt.figure(figsize=(10,5))
sns.histplot(df['text_length'], bins=20, kde=True, color='skyblue')
plt.xlabel("Number of Words in Remark")
plt.title("Distribution of Remark Lengths")
plt.show()

# Boxplot for text length by category
plt.figure(figsize=(12,6))
sns.boxplot(x='label', y='text_length', data=df)
plt.xticks(rotation=45)
plt.ylabel("Words per Remark")
plt.title("Text Length per Category")
plt.show()

# --------------------------
# Step 4: Overall Word Frequency
# --------------------------
all_words = ' '.join(df['text']).lower().split()
word_freq = Counter(all_words)
common_words = word_freq.most_common(20)
print("\nMost common words overall:")
print(common_words)

# Word Cloud for all remarks
wordcloud = WordCloud(width=800, height=400, background_color='white').generate(' '.join(df['text']))
plt.figure(figsize=(15,7))
plt.imshow(wordcloud, interpolation='bilinear')
plt.axis("off")
plt.title("Word Cloud of All Remarks")
plt.show()

# --------------------------
# Step 5: Category-specific Word Clouds
# --------------------------
for category in df['label'].unique():
    text = ' '.join(df[df['label'] == category]['text']).lower()
    wordcloud = WordCloud(width=600, height=300, background_color='white').generate(text)
    plt.figure(figsize=(10,5))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis("off")
    plt.title(f"Word Cloud for {category}")
    plt.show()

# --------------------------
# Step 6: TF-IDF + PCA Visualization
# --------------------------
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(df['text'])

pca = PCA(n_components=2)
X_pca = pca.fit_transform(X.toarray())

plt.figure(figsize=(12,6))
sns.scatterplot(x=X_pca[:,0], y=X_pca[:,1], hue=df['label'], palette='tab10', s=60)
plt.title("TF-IDF PCA Projection of Remarks by Category")
plt.xlabel("PCA Component 1")
plt.ylabel("PCA Component 2")
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
plt.show()

# --------------------------
# Step 7: Check Missing & Duplicates
# --------------------------
print("\nMissing values per column:")
print(df.isnull().sum())
print("\nNumber of duplicate rows:", df.duplicated().sum())

# --------------------------
# Step 8: Optional - Category Word Counts (Barplot)
# --------------------------
plt.figure(figsize=(12,6))
category_word_counts = df.groupby('label')['text_length'].mean().sort_values()
sns.barplot(x=category_word_counts.index, y=category_word_counts.values, palette='coolwarm')
plt.xticks(rotation=45)
plt.ylabel("Average Words per Remark")
plt.title("Average Remark Length per Category")
plt.show()

print("\nEDA Completed Successfully!")
