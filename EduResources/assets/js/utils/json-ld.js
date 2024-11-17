// JSON-LD Generator Class
class JSONLDGenerator {
    constructor() {
        this.baseUrl = 'https://bcaexamprep.blogspot.com/';
    }

    generateResourceJSON(content) {
        return {
            "@context": "https://schema.org",
            "@type": "LearningResource",
            "@id": `${this.baseUrl}#resource-${content.id}`,
            "name": content.title,
            "educationalAlignment": {
                "@type": "AlignmentObject",
                "alignmentType": "educationalSubject",
                "targetName": content.type
            },
            "learningResourceType": this.mapContentType(content.type),
            "keywords": content.tags,
            "dateCreated": content.dateAdded,
            "url": content.url,
            "thumbnailUrl": content.thumbnail,
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": content.rating,
                "ratingCount": content.ratingCount,
                "bestRating": "5",
                "worstRating": "1"
            },
            "provider": {
                "@type": "Organization",
                "name": "BCA Exam Prep",
                "url": this.baseUrl
            }
        };
    }

    mapContentType(type) {
        const typeMapping = {
            'video': 'VideoObject',
            'article': 'Article',
            'pdf': 'PDF',
            'interactive': 'Interactive'
            // Add more mappings as needed
        };
        return typeMapping[type] || 'LearningResource';
    }

    generateWebPageJSON(contents) {
        return {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "EduContent Hub: Your Gateway to Quality Learning Resources",
            "description": "Collection of educational resources a market place",
            "provider": {
                "@type": "Organization",
                "name": "BCA Exam Preparation",
                "url": this.baseUrl
            },
            "about": {
                "@type": "Thing",
                "name": "BCA Exam Preparation"
            },
            "hasPart": contents.map(content => ({
                "@type": "LearningResource",
                "@id": `${this.baseUrl}#resource-${content.id}`
            }))
        };
    }

    injectJSONLD(contents) {
        // Remove any existing JSON-LD scripts
        const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
        existingScripts.forEach(script => script.remove());

        // Create and inject WebPage JSON-LD
        const webPageScript = document.createElement('script');
        webPageScript.type = 'application/ld+json';
        webPageScript.textContent = JSON.stringify(this.generateWebPageJSON(contents));
        document.head.appendChild(webPageScript);

        // Create and inject individual resource JSON-LD
        contents.forEach(content => {
            const resourceScript = document.createElement('script');
            resourceScript.type = 'application/ld+json';
            resourceScript.textContent = JSON.stringify(this.generateResourceJSON(content));
            document.head.appendChild(resourceScript);
        });
    }
}
        
export default JSONLDGenerator;     
