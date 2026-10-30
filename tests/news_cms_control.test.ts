import { test } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/server/db';
import { NewsArticle, CompanySettings } from '../src/types';

test('News & Site Content CMS Admin Control', async (t) => {
  
  await t.test('seeds initial news articles correctly', () => {
    const news = db.get('news');
    assert.ok(Array.isArray(news), 'News should be an array');
    assert.ok(news.length >= 3, 'Should have at least 3 initial articles');
    assert.ok(news[0].title.ar, 'Article should have Arabic title');
    assert.ok(news[0].image, 'Article should have an image');
  });

  await t.test('can create a new article with image and category', () => {
    const initialCount = db.get('news').length;
    const newArticle: NewsArticle = {
      id: `news-test-${Date.now()}`,
      slug: `test-article-${Date.now()}`,
      title: { ar: 'مشروع فيلا الشروق المعماري', en: 'Al-Shorouk Villa Project' },
      excerpt: { ar: 'نبذة عن المشروع والتصميم المودرن', en: 'Modern design insights' },
      content: { ar: 'محتوى كامل وتفاصيل التوريدات والرخام', en: 'Full specifications' },
      image: '/images/portfolio_villa_new_cairo_1792469679890.jpg',
      category: 'projects',
      categoryLabel: { ar: 'أخبار المشاريع', en: 'Projects News' },
      author: 'م. أحمد العوضي',
      publishedAt: '2026-10-30',
      isPublished: true,
      views: 0
    };

    db.update('news', list => [newArticle, ...list]);
    const updated = db.get('news');
    assert.strictEqual(updated.length, initialCount + 1, 'Article count should increment by 1');
    assert.strictEqual(updated[0].id, newArticle.id, 'New article should be at front');
  });

  await t.test('can toggle publish visibility or update news article', () => {
    const news = db.get('news');
    const firstId = news[0].id;
    const initialStatus = news[0].isPublished;

    db.update('news', list => list.map(a => a.id === firstId ? { ...a, isPublished: !initialStatus } : a));
    const reloaded = db.get('news').find(a => a.id === firstId);
    assert.strictEqual(reloaded?.isPublished, !initialStatus, 'Article published status should toggle');
  });

  await t.test('can delete news article from admin', () => {
    const news = db.get('news');
    const targetId = news[0].id;
    const countBefore = news.length;

    db.update('news', list => list.filter(a => a.id !== targetId));
    const countAfter = db.get('news').length;
    assert.strictEqual(countAfter, countBefore - 1, 'Article count should decrease by 1');
    assert.ok(!db.get('news').some(a => a.id === targetId), 'Target article should no longer exist');
  });

  await t.test('settings pageControls can toggle sections', () => {
    const settings = db.get('settings');
    assert.ok(settings.pageControls !== undefined, 'Settings should have pageControls');

    db.update('settings', s => ({
      ...s,
      pageControls: {
        ...(s.pageControls || {
          showNews: true,
          showPortfolio: true,
          showServices: true,
          showFaq: true,
          announcementBarEnabled: true,
          announcementText: { ar: '', en: '' }
        }),
        showNews: false
      }
    }));

    const updatedSettings = db.get('settings');
    assert.strictEqual(updatedSettings.pageControls?.showNews, false, 'showNews should be disabled');
  });

});
