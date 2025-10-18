import { GM_registerMenuCommand } from '$';
import { BracketReplacer } from './replacers/BracketReplacer';
import { FancyTextReplacer } from './replacers/FancyTextReplacer';

const fancyReplacer = FancyTextReplacer.create();
const bracketReplacer = BracketReplacer.create();

GM_registerMenuCommand('替换花体字符', () => fancyReplacer.replaceInDocument());
GM_registerMenuCommand('替换中日文括号', () => bracketReplacer.replaceInDocument());
