import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Path to the templates.json file
        const filePath = path.join(process.cwd(), 'src/data/templates.json');
        
        // Read existing templates
        let templates = [];
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf-8');
            templates = JSON.parse(fileData);
        }
        
        // Append new template
        templates.push(body);
        
        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(templates, null, 4), 'utf-8');
        
        return NextResponse.json({ success: true, message: 'Template saved successfully.' });
    } catch (error) {
        console.error('Error saving template:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
