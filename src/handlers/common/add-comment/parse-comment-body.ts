interface ParsedComment {
  text: string;
  imageUrls: string[];
}

export function parseCommentBody(commentBody: string): ParsedComment {
  const imgTagRegex = /<img[^>]+src="([^">]+)"[^>]*>/g;
  let match;
  let text = commentBody;
  const imageUrls: string[] = [];

  while ((match = imgTagRegex.exec(commentBody)) !== null) {
    const imgTag = match[0];
    const src = match[1];
    imageUrls.push(src);
    text = text.replace(imgTag, `![image](${src})`);
  }

  return { text: text.trim(), imageUrls };
}
