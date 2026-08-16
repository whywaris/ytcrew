import { ToolFAQItem, ToolHowToStep } from "@/types";

export interface ToolDefinitionItem {
  slug: string;
  title: string;
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  category: string;
  type: "logic" | "youtube_api" | "open_api";
  status: "active" | "inactive";
  howToSteps: ToolHowToStep[];
  faqs: ToolFAQItem[];
  relatedTools: Array<{ slug: string; name: string; shortDescription: string }>;
  aboutContent: string;
}

/**
 * Static registry of all YT Crew tool definitions.
 * Sourced for Supabase database migrations and high-performance server/edge rendering.
 */
export const toolDefinitions: Record<string, ToolDefinitionItem> = {
  // 0. Base Migrated Tool
  "youtube-timestamp-link-generator": {
    slug: "youtube-timestamp-link-generator",
    title: "YouTube Timestamp Link Generator",
    description:
      "Create direct shareable links that start playing any YouTube video at the exact second, minute, or hour you choose.",
    seoTitle: "YouTube Timestamp Link Generator - Free Online Tool | YT Crew",
    seoDescription:
      "Create direct shareable links that start playing any YouTube video at the exact second, minute, or hour you choose.",
    category: "generators",
    type: "logic",
    status: "active",
    howToSteps: [
      {
        stepNumber: 1,
        title: "Paste Your YouTube Link",
        description:
          "Copy the URL of any YouTube video, YouTube Short, or youtu.be link and paste it into the video URL box.",
      },
      {
        stepNumber: 2,
        title: "Enter the Desired Start Time",
        description:
          "Specify the exact hours, minutes, and seconds where you want the video playback to start, or pick a quick preset.",
      },
      {
        stepNumber: 3,
        title: "Generate & Copy Your Link",
        description:
          "Click 'Generate Timestamp Link', then copy your new timestamped URL or preview it right in the player before sharing.",
      },
    ],
    faqs: [
      {
        question: "How does a YouTube timestamp link work?",
        answer:
          "A timestamp link appends a special time parameter (?t=seconds or &t=seconds) to the end of a standard YouTube URL. When someone clicks or loads the link, YouTube's video player automatically seeks to and begins playback from that exact second.",
      },
      {
        question: "Do timestamp links work on mobile devices and the YouTube app?",
        answer:
          "Yes! YouTube timestamp links work across all platforms, including desktop browsers, mobile web browsers (Safari, Chrome), and the official YouTube iOS and Android mobile apps.",
      },
      {
        question: "Can I create timestamp links for YouTube Shorts?",
        answer:
          "Yes. Our tool extracts the unique video ID from any YouTube URL format, including Shorts, and generates a universal youtu.be timestamp link that starts playback at your designated timestamp.",
      },
      {
        question: "What format does YouTube accept for timestamps?",
        answer:
          "YouTube supports total seconds (e.g., ?t=90 for 1 minute and 30 seconds) as well as combinations like ?t=1m30s or ?t=1h20m15s. Our generator calculates the precise total seconds format for maximum compatibility across all devices and embedded players.",
      },
      {
        question: "Is there any limit to how many timestamp links I can create?",
        answer:
          "No! The YouTube Timestamp Link Generator on YT Crew is 100% free with unlimited usage. All conversions happen entirely on your device with no rate limits and no account required.",
      },
    ],
    relatedTools: [
      {
        slug: "youtube-video-frame-by-frame",
        name: "YouTube Video Frame By Frame",
        shortDescription:
          "Inspect YouTube videos frame by frame with precision scrubbing and time seek controls.",
      },
      {
        slug: "youtube-video-backlink-generator",
        name: "YouTube Video Backlink Generator",
        shortDescription:
          "Generate embeddable HTML, Markdown, and BBCode backlinks for your YouTube videos.",
      },
      {
        slug: "youtube-subscribe-link-generator",
        name: "YouTube Subscribe Link Generator",
        shortDescription:
          "Create auto-prompt 1-click subscription links for your YouTube channel.",
      },
    ],
    aboutContent:
      "Whether you are a YouTube creator sharing key chapter highlights, an educator referencing a specific section of a lecture, or a marketer citing proof points in a product demonstration, getting viewers directly to the most relevant moment of a video is critical for maintaining audience retention and engagement.\n\nThe YouTube Timestamp Link Generator by YT Crew makes it effortless to convert standard YouTube links into precision-timed URLs. Instead of telling viewers to \"skip to 4:15\" manually in your social posts, newsletters, Discord communities, or blog articles, you can give them a one-click link that takes them straight to the action.\n\nThis tool runs entirely in your browser with zero latency, zero backend logging, and complete privacy. It supports standard desktop URLs, mobile links, youtu.be shortlinks, and YouTube Shorts formats seamlessly.",
  },

  // 1. YouTube Video Frame By Frame
  "youtube-video-frame-by-frame": {
    slug: "youtube-video-frame-by-frame",
    title: "YouTube Video Frame By Frame Player",
    description:
      "Inspect YouTube videos frame-by-frame with precision sub-second stepping, variable slow-motion speeds, and instant frame timestamp sharing.",
    seoTitle: "YouTube Video Frame By Frame Player - Step Through Frames Online | YT Crew",
    seoDescription:
      "Analyze and step through any YouTube video frame by frame with precision controls (0.1s and 0.033s), variable slow motion, and instant timestamp link generator.",
    category: "utilities",
    type: "logic",
    status: "active",
    howToSteps: [
      {
        stepNumber: 1,
        title: "Paste the YouTube Video URL",
        description:
          "Enter any standard YouTube link, Shorts URL, or 11-character video ID into the input field above and click 'Load & Inspect Video'.",
      },
      {
        stepNumber: 2,
        title: "Navigate with Frame Stepping Controls",
        description:
          "Use the fine-grained seek buttons (-0.1s, -1 Frame, +1 Frame, +0.1s, ±1s, ±5s) or set the playback speed to 0.25x to locate the exact frame you need.",
      },
      {
        stepNumber: 3,
        title: "Copy the Exact Frame Timestamp",
        description:
          "View the millisecond-accurate timestamp display and click 'Copy Link' to generate a shareable URL starting at that precise moment.",
      },
    ],
    faqs: [
      {
        question: "How accurate is the frame-by-frame stepping on YouTube videos?",
        answer:
          "Standard web-embedded YouTube players do not expose raw video frame decoders directly to browser JavaScript. This tool approximates frame steps by seeking at 33-millisecond increments (corresponding to standard 30fps video cadence) and 100-millisecond intervals, giving you virtually frame-accurate inspection without needing to download massive video files.",
      },
      {
        question: "Can I watch videos in slow motion with this tool?",
        answer:
          "Yes! You can toggle playback speeds between 0.25x, 0.5x, 0.75x, 1x, 1.5x, and 2x. Slowing the video down to 0.25x makes it easy to catch fast-moving action, subtle animation transitions, or sports replays.",
      },
      {
        question: "Does this tool support YouTube Shorts and unlisted videos?",
        answer:
          "Yes, all public and unlisted YouTube video URLs—including Shorts and youtu.be shortlinks—work seamlessly as long as embedding is permitted by the video uploader.",
      },
      {
        question: "Can I extract the exact timestamp link for a specific frame?",
        answer:
          "Absolutely. As you navigate forward and backward through the video, the tool continuously updates a shareable timestamp link that you can copy in one click.",
      },
      {
        question: "Do I need to install any browser extensions or plugins?",
        answer:
          "No plugins or extensions are required. The tool runs 100% client-side in your web browser using the official YouTube IFrame Player API.",
      },
      {
        question: "Is there any charge or daily limit for using this tool?",
        answer:
          "The YouTube Video Frame By Frame Player on YT Crew is completely free to use with unlimited video inspections and zero account requirements.",
      },
    ],
    relatedTools: [
      {
        slug: "youtube-timestamp-link-generator",
        name: "YouTube Timestamp Link Generator",
        shortDescription:
          "Create shareable YouTube links that jump directly to any specific hour, minute, or second.",
      },
      {
        slug: "youtube-thumbnail-downloader",
        name: "YouTube Thumbnail Downloader",
        shortDescription:
          "Download high-resolution 1080p and 4K YouTube thumbnails in one click.",
      },
      {
        slug: "youtube-thumbnail-resizer",
        name: "YouTube Thumbnail Resizer",
        shortDescription:
          "Resize and crop your custom thumbnails to YouTube's exact 1280x720 16:9 standard.",
      },
    ],
    aboutContent:
      "Inspecting YouTube videos frame-by-frame is an essential capability for video editors, digital artists, sports analysts, gamers examining hitboxes, and content creators studying competitors' editing techniques. Standard YouTube player keyboard shortcuts often skip several frames at once, making it frustrating to pinpoint crucial micro-moments.\n\nThe YouTube Video Frame By Frame tool by YT Crew provides high-precision sub-second navigation controls directly in your web browser. With dedicated ±33ms (single frame at 30fps) and ±100ms stepper buttons, slow-motion playback ranging from 0.25x to 2x speed, and real-time millisecond readouts, you can dissect any sequence with surgical accuracy.\n\nAll playback processing happens locally on your device without downloading gigabytes of source video. Once you find the exact moment you need, grab a one-click timestamp link to share with your team or audience immediately.",
  },

  // 2. YouTube Username Generator
  "youtube-username-generator": {
    slug: "youtube-username-generator",
    title: "YouTube Username & Handle Generator",
    description:
      "Generate catchy, memorable, and available YouTube channel names and handle suggestions tailored to your niche and creative style.",
    seoTitle: "YouTube Username & Handle Generator - Catchy Channel Name Ideas | YT Crew",
    seoDescription:
      "Generate 15+ creative, professional, gaming, and funny YouTube channel name ideas and unique @handle suggestions in seconds. 100% free.",
    category: "generators",
    type: "logic",
    status: "active",
    howToSteps: [
      {
        stepNumber: 1,
        title: "Enter Your Topic or Keyword",
        description:
          "Type your niche, main content topic, or personal name (e.g. Gaming, Tech, Finance, Cooking, Vlog) into the keyword field.",
      },
      {
        stepNumber: 2,
        title: "Select Channel Style & Options",
        description:
          "Choose your preferred tone—Creative, Professional, Gaming, Funny, Tech, or Minimal—and toggle optional creator tags or numbers.",
      },
      {
        stepNumber: 3,
        title: "Generate & Copy Your Favorite Names",
        description:
          "Click 'Generate Usernames' to instantly receive dozens of curated suggestions. Click any name to copy it directly or use 'Shuffle More' for new ideas.",
      },
    ],
    faqs: [
      {
        question: "How does the YouTube Username Generator create name ideas?",
        answer:
          "Our generator combines your core keyword with curated psychological prefixes, niche-specific power suffixes, and stylistic naming algorithms (such as alliteration, branding buzzwords, and creator handles) to create memorable names.",
      },
      {
        question: "What makes a good YouTube channel name and handle?",
        answer:
          "A great YouTube name is easy to pronounce, memorable, relevant to your niche, under 20 characters, and easy to type without confusing spelling variations. It should work well as an @handle across YouTube, TikTok, X (Twitter), and Instagram.",
      },
      {
        question: "Can I change my YouTube channel name and handle later?",
        answer:
          "Yes! YouTube allows creators to update their channel display name and unique @handle up to twice every 14 days directly in the YouTube Studio customization tab without losing subscribers or watch time.",
      },
      {
        question: "Are these generated names guaranteed to be available on YouTube?",
        answer:
          "While our algorithm generates unique naming combinations, handle availability on YouTube depends on existing channel registrations. We recommend checking your top 3 favorite choices directly in YouTube Studio.",
      },
      {
        question: "Is this tool completely free to use?",
        answer:
          "Yes, the YouTube Username Generator is 100% free with unlimited generations, no registration required, and instant client-side execution.",
      },
    ],
    relatedTools: [
      {
        slug: "youtube-subscribe-link-generator",
        name: "YouTube Subscribe Link Generator",
        shortDescription:
          "Create 1-click auto-confirmation subscribe links for your new channel handle.",
      },
      {
        slug: "youtube-banner-resizer",
        name: "YouTube Banner Resizer",
        shortDescription:
          "Design and resize custom 2560x1440 channel art with safe-zone guides.",
      },
      {
        slug: "youtube-font-generator",
        name: "YouTube Font Generator",
        shortDescription:
          "Generate stylish Unicode typography for your channel name and video descriptions.",
      },
    ],
    aboutContent:
      "Choosing the right YouTube channel name and handle is one of the most critical foundational branding decisions for any content creator. Your name sets first impressions in search results, recommended video feeds, and social media mentions, influencing whether new viewers click and subscribe.\n\nThe YouTube Username Generator on YT Crew helps creators, brands, and streamers break through creative blocks by producing dozens of high-impact name variations tailored to your specific niche. Whether you are building a sleek tech tutorial channel, an energetic gaming stream, or an entertaining comedy hub, our styling algorithms formulate names that resonate with audiences.\n\nAll word combinations and style filters operate purely in your browser for instant responsiveness. Generate, shuffle, and copy your favorite handle concepts in seconds to kickstart your YouTube creator journey.",
  },

  // 3. Fake YouTube Comment Generator
  "fake-youtube-comment-generator": {
    slug: "fake-youtube-comment-generator",
    title: "Fake YouTube Comment Generator",
    description:
      "Create pixel-perfect YouTube comment mockups with custom usernames, verified badges, likes, pinned tags, and high-resolution PNG export.",
    seoTitle: "Fake YouTube Comment Generator - Create Realistic Comment Mockups | YT Crew",
    seoDescription:
      "Design realistic YouTube comment screenshots and mockups with custom avatars, likes, pinned status, verified badges, and high-res image download. Free online tool.",
    category: "generators",
    type: "logic",
    status: "active",
    howToSteps: [
      {
        stepNumber: 1,
        title: "Customize the Author & Message",
        description:
          "Enter your custom author name, profile initial/theme, relative timestamp (e.g. '2 hours ago'), and the comment text, or click 'Randomize' for instant realistic templates.",
      },
      {
        stepNumber: 2,
        title: "Toggle Creator Badges & Likes",
        description:
          "Configure the number of upvotes/likes and enable special badges such as the Verified checkmark, Pinned by creator tag, or Creator Heart.",
      },
      {
        stepNumber: 3,
        title: "Preview & Download as PNG",
        description:
          "Inspect the live dark-theme YouTube comment preview and click 'Download as PNG' to export a crisp 2x retina graphic for your video B-roll or thumbnail.",
      },
    ],
    faqs: [
      {
        question: "What can I use the Fake YouTube Comment Generator for?",
        answer:
          "This tool is designed for content creators, video editors, educators, and marketers who need realistic visual mockups for YouTube video B-roll, thumbnail graphics, presentation slides, case studies, or design prototypes.",
      },
      {
        question: "How high is the resolution of the exported PNG image?",
        answer:
          "Images are rendered at 2x high-density (Retina) resolution via HTML5 canvas, ensuring clean lines, sharp typography, and crisp borders when composited into 1080p and 4K video timelines.",
      },
      {
        question: "Can I customize the like count and timestamp?",
        answer:
          "Yes! You can specify any numerical like count (which automatically formats to K/M shorthand) and any custom relative timestamp such as '5 minutes ago' or '3 weeks ago'.",
      },
      {
        question: "Is there any watermark on the exported mockup images?",
        answer:
          "No. All exported comment mockups are 100% watermark-free, high-resolution PNG files generated directly in your browser.",
      },
      {
        question: "What is the acceptable use policy for this tool?",
        answer:
          "This generator is strictly for educational, illustrative, entertainment, and design mockup purposes. It must not be used to deceive viewers, fabricate defamatory statements, or falsify commercial engagement metrics.",
      },
    ],
    relatedTools: [
      {
        slug: "youtube-thumbnail-resizer",
        name: "YouTube Thumbnail Resizer",
        shortDescription:
          "Crop and format your custom thumbnail art to YouTube's exact 1280x720 dimensions.",
      },
      {
        slug: "youtube-font-generator",
        name: "YouTube Font Generator",
        shortDescription:
          "Format your comment text and video descriptions with bold and stylish Unicode fonts.",
      },
      {
        slug: "youtube-username-generator",
        name: "YouTube Username Generator",
        shortDescription:
          "Generate authentic YouTube channel names and handle ideas.",
      },
    ],
    aboutContent:
      "Visual storytelling in modern YouTube videos frequently involves showing on-screen community reactions, social proof, testimonials, or comedic viewer comments. However, capturing clean screenshots of actual comments often results in blurry scaling, inconsistent styling, or privacy concerns.\n\nThe Fake YouTube Comment Generator by YT Crew provides video editors and creators with a flexible design studio to generate pixel-perfect YouTube comment mockups. With full control over usernames, verified author badges, pinned tags, creator heart reactions, like counters, and avatar color palettes, you can create tailor-made graphics suited to your exact narrative.\n\nOur client-side canvas rendering engine exports crisp 2x retina PNG graphics that drop seamlessly into Premiere Pro, Final Cut, DaVinci Resolve, or Photoshop. Please note: This tool is strictly intended for creative mockups, educational presentations, and entertainment.",
  },

  // 4. YouTube Banner Resizer
  "youtube-banner-resizer": {
    slug: "youtube-banner-resizer",
    title: "YouTube Banner Resizer (2560 × 1440)",
    description:
      "Resize and crop your channel art to YouTube's official 2560 × 1440 px banner dimensions with real-time mobile and desktop safe-zone guides.",
    seoTitle: "YouTube Banner Resizer - Resize Channel Art to 2560x1440 Online | YT Crew",
    seoDescription:
      "Resize, crop, and optimize your YouTube channel banner to the official 2560x1440 px spec with interactive mobile safe area guides (1546x423). Free client-side tool.",
    category: "utilities",
    type: "logic",
    status: "active",
    howToSteps: [
      {
        stepNumber: 1,
        title: "Upload Your Channel Banner Image",
        description:
          "Drag and drop any PNG, JPG, or WEBP image into the upload area or click to select a file from your computer or phone.",
      },
      {
        stepNumber: 2,
        title: "Align Artwork with Safe Zone Guides",
        description:
          "Choose your preferred scaling method (Cover, Contain with background padding, or Stretch) and inspect the highlighted 1546 × 423 px safe zone.",
      },
      {
        stepNumber: 3,
        title: "Download the 2560 × 1440 Banner",
        description:
          "Select PNG or JPG format and click 'Download 2560 × 1440 Banner' to save your publication-ready channel art.",
      },
    ],
    faqs: [
      {
        question: "What are the official YouTube banner size dimensions?",
        answer:
          "YouTube recommends an overall banner image size of 2560 × 1440 pixels with a 16:9 aspect ratio. The maximum file size accepted by YouTube Studio is 6MB in PNG, JPG, or GIF format.",
      },
      {
        question: "What is the YouTube banner 'Safe Zone'?",
        answer:
          "The safe zone is the central 1546 × 423 pixel area of the banner. Content placed within this box is guaranteed to remain fully visible across all devices, including mobile smartphones, tablets, laptops, and 4K desktop monitors.",
      },
      {
        question: "Why does my banner look cut off on mobile devices?",
        answer:
          "YouTube crops the top, bottom, and outer edges of your 2560 × 1440 image on smaller screens. If your text or logo extends outside the central 1546 × 423 px safe area, it will be cropped on mobile. Our tool provides live overlays so you can verify safe zone alignment before uploading.",
      },
      {
        question: "Does this tool upload my images to any server?",
        answer:
          "No! All image rendering, scaling, and conversion happens 100% locally in your browser using HTML5 Canvas. Your artwork never leaves your device.",
      },
      {
        question: "Should I export my banner as PNG or JPG?",
        answer:
          "PNG provides the highest clarity with zero compression artifacts for text and graphics. If your resulting file is close to YouTube's 6MB upload limit, JPG is a great alternative with smaller file size.",
      },
    ],
    relatedTools: [
      {
        slug: "youtube-thumbnail-resizer",
        name: "YouTube Thumbnail Resizer",
        shortDescription:
          "Resize and crop your custom thumbnails to 1280x720 px (16:9).",
      },
      {
        slug: "youtube-username-generator",
        name: "YouTube Username Generator",
        shortDescription:
          "Find catchy branding ideas for your YouTube channel.",
      },
      {
        slug: "youtube-subscribe-link-generator",
        name: "YouTube Subscribe Link Generator",
        shortDescription:
          "Create 1-click subscription links to feature in your channel banner links.",
      },
    ],
    aboutContent:
      "Your YouTube channel banner (also known as channel art or header) is the largest visual asset on your channel homepage. It establishes your brand identity, highlights your upload schedule, and introduces your core value proposition to prospective subscribers within milliseconds of landing on your page.\n\nHowever, designing channel banners is notoriously tricky because YouTube displays a single 2560 × 1440 px canvas across radically different device viewports—from 6-inch smartphone screens to 65-inch Smart TVs. Critical channel logos and social links placed outside the central 1546 × 423 px safe zone frequently get cropped out on mobile devices.\n\nThe YouTube Banner Resizer by YT Crew eliminates guesswork by providing real-time canvas safe-zone overlays. Easily position your artwork, select fit modes, customize letterbox padding colors, and export crisp 2560 × 1440 pixel banners optimized for flawless display across all screen sizes.",
  },

  // 5. YouTube Subscribe Link Generator
  "youtube-subscribe-link-generator": {
    slug: "youtube-subscribe-link-generator",
    title: "YouTube 1-Click Subscribe Link Generator",
    description:
      "Create direct subscription deep links that prompt viewers with an automatic 'Confirm Channel Subscription' popup when clicked.",
    seoTitle: "YouTube Subscribe Link Generator - 1-Click Auto Subscribe Link | YT Crew",
    seoDescription:
      "Generate auto-confirmation YouTube subscribe links with ?sub_confirmation=1 for your channel handle or ID. Includes embeddable HTML buttons and Markdown badges.",
    category: "generators",
    type: "logic",
    status: "active",
    howToSteps: [
      {
        stepNumber: 1,
        title: "Enter Your Channel Handle or URL",
        description:
          "Paste your YouTube channel link (e.g. https://www.youtube.com/@mkbhd), custom handle (@yourname), or Channel ID.",
      },
      {
        stepNumber: 2,
        title: "Customize Button Text (Optional)",
        description:
          "Enter your custom call-to-action text (e.g. 'Subscribe on YouTube' or 'Join the Crew') to customize the embeddable button snippet.",
      },
      {
        stepNumber: 3,
        title: "Copy the Link or HTML Embed Code",
        description:
          "Click 'Copy Link' to share in your video descriptions, social bios, and email newsletters, or copy the HTML code to embed a subscribe button on your website.",
      },
    ],
    faqs: [
      {
        question: "How does the YouTube auto-subscribe confirmation link work?",
        answer:
          "When you append '?sub_confirmation=1' to a valid YouTube channel URL, desktop visitors who open the link are greeted with an immediate modal dialog asking: 'Are you sure you want to subscribe to [Channel Name]?' with a prominent 1-click Subscribe button.",
      },
      {
        question: "Why should I use an auto-subscribe link instead of a standard channel link?",
        answer:
          "Standard channel links land viewers on your homepage where they must manually find and click the subscribe button. Auto-subscribe links remove friction and convert up to 3x more external visitors (from websites, emails, and social media) into active subscribers.",
      },
      {
        question: "Does the auto-subscribe popup work on mobile devices?",
        answer:
          "On desktop browsers, the auto-confirmation popup triggers automatically. On mobile devices, opening the link seamlessly routes the user into the YouTube app or mobile web interface directly on your channel page.",
      },
      {
        question: "Can I use this link in my video descriptions and pinned comments?",
        answer:
          "Yes! Adding an auto-subscribe link in the first two lines of your video descriptions and inside your pinned comments is a proven best practice for accelerating subscriber growth.",
      },
      {
        question: "Can I embed the generated HTML button on my WordPress or Webflow site?",
        answer:
          "Yes. Our generator produces clean, standalone HTML and CSS button code that can be pasted into any website, blog sidebar, header, or documentation page without requiring third-party scripts.",
      },
    ],
    relatedTools: [
      {
        slug: "youtube-timestamp-link-generator",
        name: "YouTube Timestamp Link Generator",
        shortDescription:
          "Create direct links to specific chapters and highlights in your videos.",
      },
      {
        slug: "youtube-video-backlink-generator",
        name: "YouTube Video Backlink Generator",
        shortDescription:
          "Generate HTML and Markdown backlinks to embed your videos on websites.",
      },
      {
        slug: "youtube-watch-time-calculator",
        name: "YouTube Watch Time Calculator",
        shortDescription:
          "Track your channel's progress toward the 4,000 watch hours monetization milestone.",
      },
    ],
    aboutContent:
      "Converting external audience traffic from your website, email newsletters, blog articles, and social media bios into dedicated YouTube subscribers is one of the highest-ROI growth tactics for creators. However, directing users to a regular channel page often results in high bounce rates as viewers get distracted by recommended feeds.\n\nThe YouTube Subscribe Link Generator by YT Crew transforms your channel URL or @handle into a high-converting deep link with the '?sub_confirmation=1' parameter. When opened on desktop browsers, visitors are greeted with an unmissable confirmation dialog asking them to subscribe with a single click.\n\nIn addition to direct share links, this tool generates ready-to-use HTML subscribe buttons and GitHub Markdown badges with zero external JavaScript dependencies. Copy your link and start accelerating your subscriber growth today.",
  },

  // 6. YouTube Thumbnail Resizer
  "youtube-thumbnail-resizer": {
    slug: "youtube-thumbnail-resizer",
    title: "YouTube Thumbnail Resizer (1280 × 720)",
    description:
      "Resize and crop any image to YouTube's exact 1280 × 720 px thumbnail standard with 16:9 aspect ratio and under 2MB file optimization.",
    seoTitle: "YouTube Thumbnail Resizer - Resize Images to 1280x720 Online | YT Crew",
    seoDescription:
      "Resize, crop, and optimize your images to YouTube's 1280x720 px (16:9) thumbnail standard with smart blur padding and instant download. 100% free.",
    category: "utilities",
    type: "logic",
    status: "active",
    howToSteps: [
      {
        stepNumber: 1,
        title: "Upload Your Thumbnail Graphic",
        description:
          "Drag and drop any image (PNG, JPG, WEBP) or click to browse files from your computer or smartphone.",
      },
      {
        stepNumber: 2,
        title: "Choose Scaling & Letterbox Style",
        description:
          "Select your cropping method: Smart Cover (16:9 crop), Blur Padding (modern aesthetic background), Color Letterbox, or Exact Stretch.",
      },
      {
        stepNumber: 3,
        title: "Download 1280 × 720 Thumbnail",
        description:
          "Choose PNG (crisp quality) or JPG (web-optimized file size) and click 'Download 1280 × 720 Thumbnail' to save your image.",
      },
    ],
    faqs: [
      {
        question: "What is the recommended size for YouTube thumbnails?",
        answer:
          "YouTube recommends an image resolution of 1280 × 720 pixels (with a minimum width of 640 pixels) and a 16:9 widescreen aspect ratio. The file size must remain under 2MB in JPG, PNG, or GIF format.",
      },
      {
        question: "Why does YouTube reject my thumbnail upload?",
        answer:
          "YouTube typically rejects thumbnails if the file size exceeds 2MB, if the image resolution is smaller than 640x360, or if the file format is unsupported. Our tool automatically formats your image to exact 1280x720 dimensions under 2MB.",
      },
      {
        question: "What is the 'Blur Padding' option?",
        answer:
          "If you upload a vertical screenshot (like a smartphone screen) or a square photo, Blur Padding fills the 16:9 letterbox margins with an artistic, blurred version of your image instead of black bars, creating a sleek modern presentation.",
      },
      {
        question: "Will resizing reduce my thumbnail quality?",
        answer:
          "No. Our client-side canvas engine utilizes high-quality bicubic resampling to preserve crisp text legibility, sharp edges, and vibrant colors.",
      },
      {
        question: "Are my uploaded photos kept private?",
        answer:
          "Yes, 100%. All processing runs strictly inside your local browser. Your images are never uploaded to any remote server or stored in any database.",
      },
    ],
    relatedTools: [
      {
        slug: "youtube-banner-resizer",
        name: "YouTube Banner Resizer",
        shortDescription:
          "Resize channel art to YouTube's 2560x1440 banner specifications.",
      },
      {
        slug: "youtube-thumbnail-downloader",
        name: "YouTube Thumbnail Downloader",
        shortDescription:
          "Extract and download HD thumbnails from any existing YouTube video.",
      },
      {
        slug: "youtube-font-generator",
        name: "YouTube Font Generator",
        shortDescription:
          "Format stylized Unicode fonts for your titles and descriptions.",
      },
    ],
    aboutContent:
      "Your video thumbnail is the single most influential factor determining your YouTube Click-Through Rate (CTR). Even the most masterfully produced video will languish with low views if its thumbnail is blurry, distorted by incorrect aspect ratios, or rejected by YouTube due to oversized dimensions.\n\nYouTube requires custom thumbnails to match a 16:9 widescreen ratio with an ideal resolution of 1280 × 720 pixels and a file size under 2MB. When creators take quick screenshots or work with vertical phone recordings, manual resizing often leads to stretched graphics or harsh black borders.\n\nThe YouTube Thumbnail Resizer by YT Crew makes formatting thumbnails effortless. With one-click options for smart cropping, modern aesthetic blur-padding, custom solid backgrounds, and high-fidelity PNG/JPG exports, you can prepare professional thumbnails in seconds.",
  },

  // 7. YouTube Video Backlink Generator
  "youtube-video-backlink-generator": {
    slug: "youtube-video-backlink-generator",
    title: "YouTube Video Backlink Generator",
    description:
      "Generate SEO-optimized HTML, Markdown, and BBCode embed snippets pointing to your YouTube video to build high-authority external referral traffic.",
    seoTitle: "YouTube Video Backlink Generator - Embed & Link Code Creator | YT Crew",
    seoDescription:
      "Generate ready-to-use HTML backlinks, visual thumbnail cards, Markdown links, and forum BBCode for your YouTube videos to boost SEO and views. Free tool.",
    category: "generators",
    type: "logic",
    status: "active",
    howToSteps: [
      {
        stepNumber: 1,
        title: "Paste Your YouTube Video Link",
        description:
          "Enter any YouTube video URL, Shorts link, or youtu.be shortlink into the input field above.",
      },
      {
        stepNumber: 2,
        title: "Add Custom Anchor Text (Optional)",
        description:
          "Enter a descriptive keyword anchor or your video title (e.g. 'Complete Next.js Tutorial 2026') to maximize SEO relevancy.",
      },
      {
        stepNumber: 3,
        title: "Copy the Backlink Snippets",
        description:
          "Instantly copy your desired backlink format (Standard HTML, Visual Thumbnail Card, Markdown, or BBCode) and paste it into websites, blogs, forums, or documentation.",
      },
    ],
    faqs: [
      {
        question: "What are YouTube video backlinks and why are they important?",
        answer:
          "A YouTube backlink is an external hyperlink on a third-party website, blog, forum, or social platform that points to your YouTube video. High-quality backlinks drive external referral views, signal content authority to search engines, and help your video rank higher in Google and YouTube search results.",
      },
      {
        question: "Which backlink format should I use for blog posts and websites?",
        answer:
          "For WordPress, Webflow, Medium, and custom websites, use the Standard HTML Hyperlink or the HTML Visual Thumbnail Card format for high click-through rates.",
      },
      {
        question: "Where can I use the Markdown backlink format?",
        answer:
          "Markdown links are formatted specifically for GitHub README files, Notion documents, Reddit posts, Slack, Discord channels, and developer documentation.",
      },
      {
        question: "What is BBCode format used for?",
        answer:
          "BBCode (Bulletin Board Code) is the standard formatting syntax used on community forums and discussion boards powered by XenForo, vBulletin, phpBB, and Discourse.",
      },
      {
        question: "Does building backlinks improve my video's YouTube SEO score?",
        answer:
          "Yes. YouTube's recommendation algorithm rewards videos that bring external sessions to the platform. Backlinks embedded in high-intent articles and community discussions provide sustained, evergreen traffic outside the standard browse feed.",
      },
    ],
    relatedTools: [
      {
        slug: "youtube-timestamp-link-generator",
        name: "YouTube Timestamp Link Generator",
        shortDescription:
          "Generate precision start-time links for key video highlights.",
      },
      {
        slug: "youtube-subscribe-link-generator",
        name: "YouTube Subscribe Link Generator",
        shortDescription:
          "Create auto-prompt 1-click subscription links for your channel.",
      },
      {
        slug: "youtube-watch-time-calculator",
        name: "YouTube Watch Time Calculator",
        shortDescription:
          "Calculate watch time hours and monitor monetization progress.",
      },
    ],
    aboutContent:
      "Search Engine Optimization (SEO) for YouTube extends far beyond video tags and keywords in your title. Building external backlinks from authoritative websites, blogs, discussion forums, and developer repositories sends powerful trust signals to both Google Search and YouTube's recommendation algorithms.\n\nWhen high-intent viewers click external links to watch your video, YouTube registers an external session initiation—often rewarding your video with increased impressions in recommended feeds. However, manually writing HTML anchor tags, thumbnail card wrappers, Markdown links, and forum BBCodes for every video is tedious.\n\nThe YouTube Video Backlink Generator by YT Crew automates code generation across five industry-standard formats. Simply paste your video link and custom anchor text to produce clean, accessible snippets ready to embed across the web.",
  },

  // 8. YouTube Watch Time Calculator
  "youtube-watch-time-calculator": {
    slug: "youtube-watch-time-calculator",
    title: "YouTube Watch Time & Monetization Calculator",
    description:
      "Calculate your channel's total watch time hours and track exact progress toward the YouTube Partner Program (YPP) 4,000 public watch hours requirement.",
    seoTitle: "YouTube Watch Time Calculator - Track 4000 Hours Monetization | YT Crew",
    seoDescription:
      "Calculate total watch time hours from views and average duration. Track your percentage progress toward the 4,000 hours YouTube monetization threshold. Free tool.",
    category: "utilities",
    type: "logic",
    status: "active",
    howToSteps: [
      {
        stepNumber: 1,
        title: "Select Your Calculation Method",
        description:
          "Choose whether to calculate watch time based on your total video views and average view duration, or enter your accumulated watch hours directly.",
      },
      {
        stepNumber: 2,
        title: "Input Your Channel Metrics",
        description:
          "Enter your view count and average view duration (minutes and seconds) from your YouTube Studio analytics.",
      },
      {
        stepNumber: 3,
        title: "Analyze Your Monetization Progress",
        description:
          "View your total watch hours, percentage progress toward the 4,000-hour threshold, remaining hours needed, and estimated additional views required to qualify.",
      },
    ],
    faqs: [
      {
        question: "What is the YouTube Partner Program (YPP) watch time requirement?",
        answer:
          "To qualify for YouTube channel monetization via ad revenue (YPP), your channel must accumulate at least 4,000 valid public watch hours within the past 12 consecutive months (365 days), along with at least 1,000 subscribers.",
      },
      {
        question: "Do YouTube Shorts views count toward the 4,000 watch hours?",
        answer:
          "No. Watch time generated from the vertical YouTube Shorts feed does NOT count toward the 4,000 public watch hours requirement. For Shorts creators, YouTube offers an alternative threshold: 10 million valid public Shorts views within the past 90 days.",
      },
      {
        question: "Do unlisted, private, or deleted videos count toward watch hours?",
        answer:
          "No. Only watch hours from active, public long-form videos count toward the monetization requirement. Hours from unlisted videos, private videos, deleted videos, or ad campaigns are excluded.",
      },
      {
        question: "What happens if I don't reach 4,000 hours within 12 months?",
        answer:
          "The 4,000-hour requirement is calculated on a rolling 365-day window. Watch hours earned more than 365 days ago gradually expire from your count as new hours from the current days are added.",
      },
      {
        question: "How does this calculator estimate the views needed for monetization?",
        answer:
          "The tool calculates your remaining watch time deficit in seconds and divides it by your average view duration in seconds, providing a realistic target for how many additional views you need at your current audience retention rate.",
      },
    ],
    relatedTools: [
      {
        slug: "youtube-subscribe-link-generator",
        name: "YouTube Subscribe Link Generator",
        shortDescription:
          "Create 1-click subscription links to help reach your 1,000 subscriber milestone.",
      },
      {
        slug: "youtube-video-backlink-generator",
        name: "YouTube Video Backlink Generator",
        shortDescription:
          "Build external backlinks to drive high-retention views to your long-form videos.",
      },
      {
        slug: "youtube-timestamp-link-generator",
        name: "YouTube Timestamp Link Generator",
        shortDescription:
          "Share chapter highlights to improve audience engagement and average view duration.",
      },
    ],
    aboutContent:
      "Reaching the YouTube Partner Program (YPP) milestone of 4,000 public watch hours in a rolling 12-month period is one of the most exciting achievements for emerging YouTube creators. However, understanding how individual video views and retention metrics translate into total watch hours can be difficult to conceptualize without clear math.\n\nThe YouTube Watch Time & Monetization Calculator by YT Crew provides creators with clear visibility into their monetization trajectory. By analyzing total view counts alongside average audience retention, the calculator breaks down your cumulative watch time in hours and minutes, compares it against the 4,000-hour threshold, and displays a real-time progress bar.\n\nAdditionally, the tool calculates the exact number of additional views you need based on your channel's average duration, helping you set achievable content production goals to reach monetization faster.",
  },

  // 9. YouTube Thumbnail Downloader
  "youtube-thumbnail-downloader": {
    slug: "youtube-thumbnail-downloader",
    title: "YouTube Thumbnail Downloader (HD & 4K)",
    description:
      "Download high-resolution YouTube video thumbnails in all available qualities (1080p Full HD, HQ, SD, and Medium) with zero compression loss.",
    seoTitle: "YouTube Thumbnail Downloader - Download Full HD & 4K Thumbnails | YT Crew",
    seoDescription:
      "Extract and download high-resolution YouTube thumbnails (1080p, 720p, 480p, SD) from any video URL or Shorts link instantly. 100% free online tool.",
    category: "utilities",
    type: "logic",
    status: "active",
    howToSteps: [
      {
        stepNumber: 1,
        title: "Paste the YouTube Video URL",
        description:
          "Copy any YouTube video link, Shorts URL, or youtu.be shortlink and paste it into the search box above.",
      },
      {
        stepNumber: 2,
        title: "Extract All Thumbnail Resolutions",
        description:
          "Click 'Extract All Thumbnails' to instantly retrieve all available image qualities from YouTube's official image servers.",
      },
      {
        stepNumber: 3,
        title: "Preview & Download in One Click",
        description:
          "Inspect the previews for Maximum HD (1080p/720p), High Quality (480p), and SD, then click 'Download' to save the graphic directly to your device.",
      },
    ],
    faqs: [
      {
        question: "What resolutions does the YouTube Thumbnail Downloader support?",
        answer:
          "Our tool extracts all official YouTube thumbnail resolutions, including Maximum Resolution (1280x720 or 1920x1080 Full HD), High Quality (480x360), Standard Definition (640x480), Medium Quality (320x180), and Default (120x90).",
      },
      {
        question: "Does this downloader require any YouTube API keys or external server calls?",
        answer:
          "No! YouTube stores video thumbnails at predictable Content Delivery Network (CDN) URLs based on the 11-character video ID. Our tool parses the ID client-side in your browser and accesses the public image stream directly.",
      },
      {
        question: "Can I download thumbnails from YouTube Shorts?",
        answer:
          "Yes. YouTube Shorts share the same underlying thumbnail infrastructure as standard videos. Simply paste the Shorts link and all resolutions will load automatically.",
      },
      {
        question: "Why do some older videos lack a Maximum HD thumbnail?",
        answer:
          "On older videos uploaded before 2012 or videos uploaded in low 240p/360p resolution, YouTube's servers may not have generated a 1080p maxresdefault image. In those cases, the High Quality (HQ 480p) thumbnail serves as the crispest available version.",
      },
      {
        question: "Is it legal to download and use YouTube thumbnails?",
        answer:
          "Downloading thumbnails for research, reference, educational review, fair use commentary, or your own channel backup is completely fine. However, you should never re-upload another creator's exact thumbnail art as your own without permission.",
      },
    ],
    relatedTools: [
      {
        slug: "youtube-thumbnail-resizer",
        name: "YouTube Thumbnail Resizer",
        shortDescription:
          "Crop and format your own thumbnails to YouTube's exact 1280x720 16:9 specs.",
      },
      {
        slug: "youtube-banner-resizer",
        name: "YouTube Banner Resizer",
        shortDescription:
          "Resize channel art to 2560x1440 with safe area guides.",
      },
      {
        slug: "youtube-video-frame-by-frame",
        name: "YouTube Video Frame By Frame",
        shortDescription:
          "Step through video frames to find the perfect thumbnail screenshot moment.",
      },
    ],
    aboutContent:
      "Whether you are analyzing top-performing competitor thumbnails in your niche, building mood boards for an upcoming video project, creating video reaction cards, or recovering a lost thumbnail file from your own channel archives, getting direct access to original-quality YouTube thumbnail files is essential.\n\nWhen browsing YouTube, thumbnail images are often heavily compressed and downscaled by the web interface. The YouTube Thumbnail Downloader by YT Crew extracts direct public CDN links to the highest-fidelity raw image assets stored on YouTube's media servers, including full 1080p and 720p HD master images.\n\nWith instant client-side URL parsing, interactive resolution previews, direct file downloads, and support for all YouTube video and Shorts formats, this tool offers the fastest way to save high-res YouTube graphics.",
  },

  // 10. YouTube Font Generator
  "youtube-font-generator": {
    slug: "youtube-font-generator",
    title: "YouTube Fancy Font Generator",
    description:
      "Transform standard text into eye-catching Unicode fonts for your YouTube video titles, descriptions, community posts, and channel about bios.",
    seoTitle: "YouTube Font Generator - Fancy Text & Unicode Fonts Online | YT Crew",
    seoDescription:
      "Convert your text into 18+ fancy Unicode font styles (Bold, Cursive, Gothic, Bubble, Small Caps) for YouTube titles, descriptions, and bios. 100% free.",
    category: "generators",
    type: "logic",
    status: "active",
    howToSteps: [
      {
        stepNumber: 1,
        title: "Type or Paste Your Text",
        description:
          "Enter your YouTube video title, description headline, community poll text, or channel bio in the input box above.",
      },
      {
        stepNumber: 2,
        title: "Filter by Font Style Category",
        description:
          "Browse through categories like Bold & Strong, Cursive & Script, Gothic & Aesthetic, Circled & Boxed, or Clean & Monospace.",
      },
      {
        stepNumber: 3,
        title: "Copy & Paste Into YouTube",
        description:
          "Click the 'Copy' button beside your favorite styled font and paste it directly into YouTube Studio, video titles, or comments.",
      },
    ],
    faqs: [
      {
        question: "How do fancy Unicode fonts work on YouTube?",
        answer:
          "Standard web inputs don't allow custom font files (.ttf/.otf), but they do support the universal Unicode character set. This tool maps your standard alphanumeric letters to special mathematical alphanumeric symbols, scripts, and stylized characters defined in Unicode, allowing them to render natively everywhere.",
      },
      {
        question: "Will these fancy fonts work on mobile phones and the YouTube app?",
        answer:
          "Yes! Because Unicode is an internationally standardized character set supported across iOS, Android, macOS, Windows, and Linux, these styled fonts display properly across all devices and inside the official YouTube mobile app.",
      },
      {
        question: "Can I use fancy fonts in my YouTube video titles?",
        answer:
          "Yes! Using bold or cursive Unicode fonts for 1-2 emphasis words in your video title can make your video stand out in search results and recommended browse feeds. We recommend using stylized fonts sparingly so titles remain easy to read.",
      },
      {
        question: "Do fancy fonts affect YouTube search SEO?",
        answer:
          "Search engines index Unicode characters as distinct symbols. While YouTube's modern search algorithms understand many Unicode variations, we recommend keeping your primary target search keywords in standard plain text and using fancy fonts for accents, hooks, and description section headers.",
      },
      {
        question: "Is there any character limit for text conversion?",
        answer:
          "There is no practical character limit. You can format short video titles, entire description sections, or lengthy community announcements effortlessly.",
      },
    ],
    relatedTools: [
      {
        slug: "youtube-username-generator",
        name: "YouTube Username Generator",
        shortDescription:
          "Generate unique and memorable YouTube channel names and handles.",
      },
      {
        slug: "youtube-timestamp-link-generator",
        name: "YouTube Timestamp Link Generator",
        shortDescription:
          "Create timestamp links to format organized video descriptions.",
      },
      {
        slug: "fake-youtube-comment-generator",
        name: "Fake YouTube Comment Generator",
        shortDescription:
          "Design styled YouTube comment mockups with custom verified badges.",
      },
    ],
    aboutContent:
      "In a crowded YouTube ecosystem where billions of videos compete for viewer attention, standing out in notification feeds, search result lists, and community tabs is essential for maximizing click-through rates. While YouTube Studio does not offer built-in rich text formatting options like bold or italics for titles, the Unicode standard makes custom typography possible.\n\nThe YouTube Font Generator by YT Crew converts your plain text into more than 18 distinct Unicode typography styles in real time. From bold modern sans-serif and elegant cursive script to gothic fraktur, circled bubble letters, and small capitals, you can instantly give your channel branding a unique aesthetic.\n\nAll transformations occur instantaneously in your browser with zero external font loading dependencies. Simply type your text, choose your favorite aesthetic style, and copy it directly into your YouTube video titles, descriptions, pinned comments, or channel bio.",
  },
};
