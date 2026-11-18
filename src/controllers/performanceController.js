const supabase = require('../lib/supabase');

const EDITABLE_FIELDS = ['title', 'venue', 'starts_at', 'price'];

function parseId(rawId) {
  if (!/^\d+$/.test(String(rawId))) return null;
  const id = Number(rawId);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function isValidDate(value) {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

function isValidPrice(value) {
  return Number.isInteger(value) && value >= 0;
}

function validateField(field, value) {
  switch (field) {
    case 'title':
      return isNonEmptyString(value) ? null : 'title은 비어 있지 않은 문자열이어야 합니다.';
    case 'venue':
      return isNonEmptyString(value) ? null : 'venue는 비어 있지 않은 문자열이어야 합니다.';
    case 'starts_at':
      return isValidDate(value) ? null : 'starts_at은 올바른 날짜 형식이어야 합니다.';
    case 'price':
      return isValidPrice(value) ? null : 'price는 0 이상의 정수여야 합니다.';
    default:
      return null;
  }
}

function normalize(field, value) {
  return field === 'title' || field === 'venue' ? value.trim() : value;
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function getPerformances(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('performances')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    return res.status(200).json(data ?? []);
  } catch (error) {
    next(error);
  }
}

async function createPerformance(req, res, next) {
  try {
    const body = isPlainObject(req.body) ? req.body : {};
    const { title, venue, starts_at, price } = body;

    const missing = EDITABLE_FIELDS.filter(
      (field) => body[field] === undefined || body[field] === null
    );
    if (missing.length > 0) {
      return res.status(400).json({
        error: `필수 입력값이 누락되었습니다: ${missing.join(', ')}`,
      });
    }

    for (const field of EDITABLE_FIELDS) {
      const message = validateField(field, body[field]);
      if (message) return res.status(400).json({ error: message });
    }

    const { data, error } = await supabase
      .from('performances')
      .insert({
        title: title.trim(),
        venue: venue.trim(),
        starts_at,
        price,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      message: '공연 등록 완료',
      performance: data,
    });
  } catch (error) {
    next(error);
  }
}

async function updatePerformance(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: '공연 ID는 양의 정수여야 합니다.' });
    }

    const body = isPlainObject(req.body) ? req.body : {};
    const updates = {};

    for (const field of EDITABLE_FIELDS) {
      if (body[field] === undefined) continue;

      const message = validateField(field, body[field]);
      if (message) return res.status(400).json({ error: message });

      updates[field] = normalize(field, body[field]);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: '수정할 항목(title, venue, starts_at, price)을 하나 이상 입력해 주세요.',
      });
    }

    const { data, error } = await supabase
      .from('performances')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: '해당 공연을 찾을 수 없습니다.' });
    }

    return res.status(200).json({
      message: '공연 수정 완료',
      performance: data,
    });
  } catch (error) {
    next(error);
  }
}

async function deletePerformance(req, res, next) {
  try {
    const id = parseId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: '공연 ID는 양의 정수여야 합니다.' });
    }

    const { data, error } = await supabase
      .from('performances')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: '해당 공연을 찾을 수 없습니다.' });
    }

    return res.status(200).json({ message: '공연 삭제 완료' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPerformances,
  createPerformance,
  updatePerformance,
  deletePerformance,
};
